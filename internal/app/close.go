package app

import (
	"context"
	"errors"
	"time"
)

func (a *App) close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	errs := make([]error, 0, 3)
	if a.previews != nil {
		errs = append(errs, a.previews.Close(ctx))
	}
	errs = append(errs, a.cache.Close(), a.db.Close())
	return errors.Join(errs...)
}
