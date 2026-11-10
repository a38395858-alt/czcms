package hts

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type officialRelease struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Start       string `json:"releaseStartDate"`
}

func periodAt(now time.Time, zone *time.Location) string {
	now = now.In(zone)
	due := time.Date(now.Year(), now.Month(), 1, 2, 0, 0, 0, zone)
	if now.Before(due) {
		due = due.AddDate(0, -1, 0)
	}
	return due.Format("2006-01")
}

func nextDue(now time.Time, zone *time.Location) time.Time {
	now = now.In(zone)
	due := time.Date(now.Year(), now.Month(), 1, 2, 0, 0, 0, zone)
	if !now.Before(due) {
		due = due.AddDate(0, 1, 0)
	}
	return due
}

func (s *Service) download(ctx context.Context, path string, limit int64) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(s.options.BaseURL, "/")+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "FreightVanta HTS Lookup/1.0 (https://freightvanta.com)")
	req.Header.Set("Accept", "application/json")
	response, err := s.options.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return nil, fmt.Errorf("USITC returned HTTP %d", response.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, limit+1))
	if int64(len(body)) > limit {
		return nil, errors.New("USITC response exceeds size limit")
	}
	return body, err
}

func (s *Service) currentRelease(ctx context.Context) (officialRelease, error) {
	body, err := s.download(ctx, "/releaseList", 2<<20)
	if err != nil {
		return officialRelease{}, err
	}
	var releases []officialRelease
	if err = json.Unmarshal(body, &releases); err != nil {
		return officialRelease{}, errors.New("USITC release metadata is not valid JSON")
	}
	current := []officialRelease{}
	for _, r := range releases {
		if r.Status == "current" {
			current = append(current, r)
		}
	}
	if len(current) != 1 || current[0].Name == "" || current[0].Description == "" {
		return officialRelease{}, errors.New("USITC current release is ambiguous")
	}
	if _, err = time.Parse("01/02/2006", current[0].Start); err != nil {
		return officialRelease{}, errors.New("USITC effective date is missing or invalid")
	}
	return current[0], nil
}

func (s *Service) Sync(ctx context.Context) error {
	if err := s.ensureSeed(ctx); err != nil {
		return err
	}
	now := time.Now()
	lease := timestamp(now.Add(6 * time.Minute))
	updated, err := s.db.ExecContext(ctx, `UPDATE hts_state SET lease_until=?,last_attempt_at=? WHERE id=1 AND (lease_until='' OR lease_until<=?)`, lease, timestamp(now), timestamp(now))
	if err != nil {
		return err
	}
	if n, _ := updated.RowsAffected(); n != 1 {
		return ErrBusy
	}
	defer func() {
		finish, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_, _ = s.db.ExecContext(finish, `UPDATE hts_state SET lease_until='' WHERE id=1 AND lease_until=?`, lease)
	}()
	period := periodAt(now, s.zone)
	err = s.fetchAndReplace(ctx, period)
	if err == nil {
		return nil
	}
	if errors.Is(ctx.Err(), context.Canceled) {
		return err
	} // Shutdown is not an upstream failure alert.
	// Job deadlines must still persist the error and enqueue an alert.
	failureCtx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 5*time.Second)
	defer cancel()
	ctx = failureCtx
	detail := err.Error()
	if len(detail) > 800 {
		detail = detail[:800]
	}
	_, _ = s.db.ExecContext(ctx, `UPDATE hts_state SET last_error=? WHERE id=1`, detail)
	s.logger.Warn("HTS 税则更新失败，继续使用上一版数据", "error", detail)
	if s.options.Alert != nil {
		alertErr := s.options.Alert(ctx, "hts-sync:"+period, "HTS 税则更新失败 · FreightVanta", "美国 HTS 官方数据同步失败。\n\n时间："+now.In(s.zone).Format(time.RFC3339)+"\n原因："+detail+"\n\n上一版数据仍正常服务。系统将于一小时后重试，也可在后台手动更新。")
		alertDetail := ""
		if alertErr != nil {
			alertDetail = alertErr.Error()
			s.logger.Warn("HTS 报警入队失败", "error", alertDetail)
		}
		_, _ = s.db.ExecContext(ctx, `UPDATE hts_state SET alert_error=? WHERE id=1`, alertDetail)
	}
	return err
}

func (s *Service) fetchAndReplace(ctx context.Context, period string) error {
	before, err := s.currentRelease(ctx)
	if err != nil {
		return err
	}
	body, err := s.download(ctx, "/exportList?from=0101&to=9999&format=JSON&styles=false", 40<<20)
	if err != nil {
		return err
	}
	after, err := s.currentRelease(ctx)
	if err != nil {
		return err
	}
	if before.Name != after.Name || before.Start != after.Start {
		return errors.New("USITC release changed during download; previous data retained")
	}
	date, _ := time.Parse("01/02/2006", before.Start)
	sum := sha256.Sum256(body)
	meta := Metadata{Release: before.Name, Label: before.Description, EffectiveDate: date.Format("2006-01-02"), RetrievedAt: timestamp(time.Now()), SHA256: hex.EncodeToString(sum[:])}
	if err = s.replace(ctx, body, meta, period); err != nil {
		return err
	}
	s.logger.Info("HTS 官方税则同步成功", "release", meta.Release)
	return nil
}

func (s *Service) Trigger() bool {
	if !s.pending.CompareAndSwap(false, true) {
		return false
	}
	select {
	case s.requests <- struct{}{}:
		return true
	default:
		s.pending.Store(false)
		return false
	}
}

func (s *Service) scheduled(ctx context.Context) {
	state, err := s.Status(ctx)
	if err != nil {
		s.logger.Warn("读取 HTS 自动更新状态失败", "error", err)
		return
	}
	now := time.Now()
	if state.Running || state.Period >= periodAt(now, s.zone) || parseStamp(state.LastAttempt).After(now.Add(-time.Hour)) {
		return
	}
	_ = s.Sync(ctx)
}

func (s *Service) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	s.cancel, s.done = cancel, make(chan struct{})
	go func() {
		defer close(s.done)
		if s.options.AutoSync {
			job, cancel := context.WithTimeout(ctx, 4*time.Minute)
			s.scheduled(job)
			cancel()
		}
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-s.requests:
				job, cancel := context.WithTimeout(ctx, 4*time.Minute)
				_ = s.Sync(job)
				cancel()
				s.pending.Store(false)
			case <-ticker.C:
				if s.options.AutoSync {
					job, cancel := context.WithTimeout(ctx, 4*time.Minute)
					s.scheduled(job)
					cancel()
				}
			}
		}
	}()
}

func (s *Service) Close(ctx context.Context) error {
	if s.cancel == nil {
		return nil
	}
	s.cancel()
	select {
	case <-s.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
