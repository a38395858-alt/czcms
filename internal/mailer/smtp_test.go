package mailer

import (
	"bufio"
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/base64"
	"io"
	"mime"
	"mime/quotedprintable"
	"net"
	"net/http"
	"net/http/httptest"
	"net/mail"
	"net/textproto"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestSMTPEncryptedTransportsAuthenticationAndMIME(t *testing.T) {
	certServer := httptest.NewTLSServer(http.NotFoundHandler())
	certs := certServer.TLS.Certificates
	roots := x509.NewCertPool()
	roots.AddCert(certServer.Certificate())
	certServer.Close()
	for _, security := range []string{"tls", "starttls"} {
		for _, mechanism := range []string{"PLAIN", "LOGIN"} {
			t.Run(security+"/"+mechanism, func(t *testing.T) {
				listener, err := net.Listen("tcp", "127.0.0.1:0")
				if err != nil {
					t.Fatal(err)
				}
				defer listener.Close()
				port := listener.Addr().(*net.TCPAddr).Port
				tlsConfig := &tls.Config{Certificates: certs, MinVersion: tls.VersionTLS12}
				if security == "tls" {
					listener = tls.NewListener(listener, tlsConfig)
				}
				captured := make(chan []byte, 1)
				serverErr := make(chan error, 1)
				go func() {
					conn, err := listener.Accept()
					if err != nil {
						serverErr <- err
						return
					}
					defer conn.Close()
					_ = conn.SetDeadline(time.Now().Add(5 * time.Second))
					rd := textproto.NewReader(bufio.NewReader(conn))
					wr := textproto.NewWriter(bufio.NewWriter(conn))
					_ = wr.PrintfLine("220 local SMTP test")
					for {
						line, err := rd.ReadLine()
						if err != nil {
							serverErr <- err
							return
						}
						switch {
						case strings.HasPrefix(line, "EHLO"):
							_ = wr.PrintfLine("250-localhost")
							_ = wr.PrintfLine("250-AUTH %s", mechanism)
							_ = wr.PrintfLine("250 STARTTLS")
						case line == "STARTTLS":
							_ = wr.PrintfLine("220 begin TLS")
							secure := tls.Server(conn, tlsConfig)
							if err := secure.Handshake(); err != nil {
								serverErr <- err
								return
							}
							conn = secure
							rd = textproto.NewReader(bufio.NewReader(conn))
							wr = textproto.NewWriter(bufio.NewWriter(conn))
						case strings.HasPrefix(line, "AUTH PLAIN "):
							plain, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(line, "AUTH PLAIN "))
							if err != nil || string(plain) != "\x00account@example.test\x00secret" {
								serverErr <- io.ErrUnexpectedEOF
								return
							}
							_ = wr.PrintfLine("235 authenticated")
						case line == "AUTH LOGIN":
							_ = wr.PrintfLine("334 VXNlcm5hbWU6")
							user, _ := rd.ReadLine()
							_ = wr.PrintfLine("334 UGFzc3dvcmQ6")
							password, _ := rd.ReadLine()
							if user != base64.StdEncoding.EncodeToString([]byte("account@example.test")) || password != base64.StdEncoding.EncodeToString([]byte("secret")) {
								serverErr <- io.ErrUnexpectedEOF
								return
							}
							_ = wr.PrintfLine("235 authenticated")
						case line == "MAIL FROM:<account@example.test>" || line == "RCPT TO:<38395858@qq.com>":
							_ = wr.PrintfLine("250 accepted")
						case line == "DATA":
							_ = wr.PrintfLine("354 content follows")
							data, err := rd.ReadDotBytes()
							if err != nil {
								serverErr <- err
								return
							}
							captured <- data
							_ = wr.PrintfLine("250 queued")
						case line == "QUIT":
							// QUIT failure after acceptance must not turn into a retry.
							_ = wr.PrintfLine("500 quit failed")
							serverErr <- nil
							return
						default:
							serverErr <- io.ErrUnexpectedEOF
							return
						}
					}
				}()
				cfg := Settings{Host: "127.0.0.1", Port: port, Security: security, Username: "account@example.test", FromEmail: "account@example.test", FromName: "网站通知"}
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer cancel()
				err = sendSMTP(ctx, cfg, "secret", "38395858@qq.com", message{subject: "新表单 · 测试", body: "姓名：张先生\n需求：运输与采购", replyTo: "buyer@example.test", messageID: "test-" + strconv.Itoa(port) + "@example.test"}, roots)
				if err != nil {
					t.Fatal(err)
				}
				if err = <-serverErr; err != nil {
					t.Fatal(err)
				}
				parsed, err := mail.ReadMessage(strings.NewReader(string(<-captured)))
				if err != nil {
					t.Fatal(err)
				}
				subject, err := (&mime.WordDecoder{}).DecodeHeader(parsed.Header.Get("Subject"))
				if err != nil || subject != "新表单 · 测试" {
					t.Fatalf("bad MIME subject: %q %v", subject, err)
				}
				body, _ := io.ReadAll(quotedprintable.NewReader(parsed.Body))
				if !strings.Contains(string(body), "张先生") || parsed.Header.Get("Reply-To") != "buyer@example.test" {
					t.Fatal("invalid UTF-8 mail or Reply-To")
				}
			})
		}
	}
}

func TestSMTPRefusesUntrustedCertificateAndHeaderInjection(t *testing.T) {
	server := httptest.NewTLSServer(http.NotFoundHandler())
	defer server.Close()
	host, port, _ := net.SplitHostPort(server.Listener.Addr().String())
	number, _ := strconv.Atoi(port)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	err := sendSMTP(ctx, Settings{Host: host, Port: number, Security: "tls"}, "", "38395858@qq.com", message{}, nil)
	if err == nil || !strings.Contains(err.Error(), "证书") {
		t.Fatalf("untrusted certificate accepted: %v", err)
	}
	raw := buildMessage(Settings{FromEmail: "account@example.test", FromName: "站点"}, "38395858@qq.com", message{subject: headerText("标题\r\nBcc: victim@example.test"), replyTo: "buyer@example.test\r\nBcc: victim@example.test", messageID: "1@example.test"})
	parsed, err := mail.ReadMessage(strings.NewReader(string(raw)))
	if err != nil {
		t.Fatal(err)
	}
	if parsed.Header.Get("Bcc") != "" || parsed.Header.Get("Reply-To") != "" {
		t.Fatal("header injection")
	}
}
