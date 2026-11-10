package hts

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"strings"
)

// Backfill only additional fields from the exact same verified export. Never
// replace an installed newer release with the bundled initial snapshot.
func (s *Service) backfillDetailRates(ctx context.Context) error {
	metadata, err := seed.ReadFile("data/current.meta.json")
	if err != nil {
		return err
	}
	var meta Metadata
	if err = json.Unmarshal(metadata, &meta); err != nil {
		return err
	}
	var currentHash string
	if err = s.db.QueryRowContext(ctx, `SELECT source_sha256 FROM hts_state WHERE id=1`).Scan(&currentHash); err != nil {
		return err
	}
	if currentHash != meta.SHA256 {
		return nil
	}
	packed, err := seed.ReadFile("data/current.json.gz")
	if err != nil {
		return err
	}
	r, err := gzip.NewReader(bytes.NewReader(packed))
	if err != nil {
		return err
	}
	defer r.Close()
	body, err := io.ReadAll(io.LimitReader(r, 40<<20))
	if err != nil {
		return err
	}
	sum := sha256.Sum256(body)
	if hex.EncodeToString(sum[:]) != currentHash {
		return errors.New("HTS detail snapshot checksum mismatch")
	}
	entries, err := normalize(body)
	if err != nil {
		return err
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var version int
	if err = tx.QueryRowContext(ctx, `SELECT source_sha256,detail_version FROM hts_state WHERE id=1`).Scan(&currentHash, &version); err != nil {
		return err
	}
	if currentHash != meta.SHA256 || version > 0 {
		return nil
	}
	statement, err := tx.PrepareContext(ctx, `UPDATE hts_entries SET special_rate=?,special_source=?,other_rate=?,other_source=? WHERE code=?`)
	if err != nil {
		return err
	}
	defer statement.Close()
	for _, e := range entries {
		if _, err = statement.ExecContext(ctx, e.SpecialRate, e.SpecialSource, e.OtherRate, e.OtherSource, e.Code); err != nil {
			return err
		}
	}
	if _, err = tx.ExecContext(ctx, `UPDATE hts_state SET detail_version=1 WHERE id=1`); err != nil {
		return err
	}
	return tx.Commit()
}

// DisplayName gives short legal leaves their nearest parent context without
// changing the official leaf description used in the classification table.
func (e Entry) DisplayName() string {
	if strings.EqualFold(e.Description, "Other") {
		for i := len(e.Hierarchy) - 1; i >= 0; i-- {
			parent := strings.TrimRight(e.Hierarchy[i].Description, ":; ")
			if parent == "" || strings.EqualFold(parent, "Other") {
				continue
			}
			if len(parent) > 1 && parent[0] >= 'A' && parent[0] <= 'Z' {
				parent = strings.ToLower(parent[:1]) + parent[1:]
			}
			name := "Other " + parent
			if !strings.Contains(strings.ToLower(name), "primary forms") {
				for _, h := range e.Hierarchy {
					if strings.HasSuffix(strings.TrimRight(strings.ToLower(h.Description), ":; "), "in primary forms") {
						name += ", in primary forms"
						break
					}
				}
			}
			return name
		}
	}
	return e.Description
}

func (e Entry) DetailURL(base string) string { return strings.TrimRight(base, "/") + "/" + e.Code }
