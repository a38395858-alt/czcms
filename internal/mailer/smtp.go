package mailer

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"errors"
	"fmt"
	"mime"
	"mime/quotedprintable"
	"net"
	"net/mail"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

type message struct{ subject, body, replyTo, messageID string }

// sendSMTP supports implicit TLS (QQ: 465) and required STARTTLS (usually 587).
// Deadlines cover the entire session, including greeting, auth, DATA and QUIT.
func sendSMTP(ctx context.Context, cfg Settings, password, recipient string, msg message, roots *x509.CertPool) error {
	address := net.JoinHostPort(cfg.Host, strconv.Itoa(cfg.Port))
	conn, err := (&net.Dialer{Timeout: 10 * time.Second}).DialContext(ctx, "tcp", address)
	if err != nil {
		return errors.New("无法连接 SMTP 服务器，请检查服务器、端口和网络")
	}
	defer conn.Close()
	deadline := time.Now().Add(30 * time.Second)
	if end, ok := ctx.Deadline(); ok && end.Before(deadline) {
		deadline = end
	}
	if err = conn.SetDeadline(deadline); err != nil {
		return errors.New("无法设置 SMTP 连接超时")
	}
	rawConn := conn
	stop := context.AfterFunc(ctx, func() { _ = rawConn.Close() })
	defer stop()
	tlsConfig := &tls.Config{ServerName: cfg.Host, MinVersion: tls.VersionTLS12, RootCAs: roots}
	if cfg.Security == "tls" {
		secure := tls.Client(conn, tlsConfig)
		if err = secure.HandshakeContext(ctx); err != nil {
			return errors.New("SMTP TLS 连接失败，请检查服务器证书和加密方式")
		}
		conn = secure
	}
	client, err := smtp.NewClient(conn, cfg.Host)
	if err != nil {
		return errors.New("SMTP 服务器未正确响应，请检查端口和加密方式")
	}
	defer client.Close()
	if cfg.Security == "starttls" {
		if ok, _ := client.Extension("STARTTLS"); !ok {
			return errors.New("SMTP 服务器不支持 STARTTLS，请选择正确的加密方式")
		}
		if err = client.StartTLS(tlsConfig); err != nil {
			return errors.New("SMTP STARTTLS 升级失败，请检查服务器证书")
		}
	}
	if cfg.Security != "tls" && cfg.Security != "starttls" {
		return errors.New("SMTP 必须使用加密连接")
	}
	if cfg.Username != "" {
		_, methods := client.Extension("AUTH")
		var auth smtp.Auth
		if strings.Contains(" "+strings.ToUpper(methods)+" ", " PLAIN ") {
			auth = smtp.PlainAuth("", cfg.Username, password, cfg.Host)
		} else if strings.Contains(" "+strings.ToUpper(methods)+" ", " LOGIN ") {
			auth = &loginAuth{username: cfg.Username, password: password}
		} else {
			return errors.New("SMTP 服务器不支持 PLAIN 或 LOGIN 认证")
		}
		if err = client.Auth(auth); err != nil {
			return errors.New("SMTP 认证失败，请检查账号及授权码；QQ 邮箱需要开启 SMTP 并使用授权码")
		}
	}
	if err = client.Mail(cfg.FromEmail); err != nil {
		return errors.New("SMTP 拒绝发件地址，请检查发件邮箱是否与账号一致")
	}
	if err = client.Rcpt(recipient); err != nil {
		return errors.New("SMTP 拒绝收件地址，请检查收件邮箱")
	}
	writer, err := client.Data()
	if err != nil {
		return errors.New("SMTP 暂时无法接收邮件")
	}
	_, err = writer.Write(buildMessage(cfg, recipient, msg))
	if err != nil {
		return errors.New("邮件传输失败，将按重试规则处理")
	}
	if err = writer.Close(); err != nil {
		return errors.New("SMTP 未确认接收邮件，将按重试规则处理")
	}
	// DATA's positive response means accepted. A failed QUIT must not resend it.
	_ = client.Quit()
	return nil
}

type loginAuth struct {
	username, password string
	step               int
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	if !server.TLS {
		return "", nil, errors.New("LOGIN requires TLS")
	}
	a.step = 0
	return "LOGIN", nil, nil
}
func (a *loginAuth) Next(_ []byte, more bool) ([]byte, error) {
	if !more {
		return nil, nil
	}
	a.step++
	switch a.step {
	case 1:
		return []byte(a.username), nil
	case 2:
		return []byte(a.password), nil
	}
	return nil, errors.New("unexpected LOGIN challenge")
}

func buildMessage(cfg Settings, recipient string, msg message) []byte {
	var out strings.Builder
	from := (&mail.Address{Name: cfg.FromName, Address: cfg.FromEmail}).String()
	fmt.Fprintf(&out, "From: %s\r\nTo: %s\r\nDate: %s\r\nSubject: %s\r\nMessage-ID: <%s>\r\n", from, recipient, time.Now().Format(time.RFC1123Z), mime.QEncoding.Encode("UTF-8", msg.subject), msg.messageID)
	if validAddress(msg.replyTo) {
		fmt.Fprintf(&out, "Reply-To: %s\r\n", msg.replyTo)
	}
	out.WriteString("MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n")
	writer := quotedprintable.NewWriter(&out)
	_, _ = writer.Write([]byte(msg.body))
	_ = writer.Close()
	return []byte(out.String())
}

func messageID(token string, cfg Settings) string {
	_, domain, _ := strings.Cut(cfg.FromEmail, "@")
	return base64.RawURLEncoding.EncodeToString([]byte(token)) + "@" + domain
}
