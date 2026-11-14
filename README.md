# UMNNI Auto Advertising

Auto rickshaw advertising website with HTML, CSS, JavaScript, and a PHP/PHPMailer enquiry handler.

Website: https://vaividhyasakshi-commits.github.io/umnni-auto/

## GitHub Pages

Pushing to `main` automatically publishes the root HTML pages and `assets/` through `.github/workflows/pages.yml`. PHP files, private configuration, and the older `umnni-auto-advertising/` copy are not included in the public website artifact. The older copy remains in this repository.

GitHub Pages serves static files and cannot execute the PHP enquiry handler. The enquiry form needs a PHP host with SMTP configured to send messages. The displayed phone, email, and WhatsApp links can be used from the Pages website.

## PHP hosting or XAMPP

1. Copy the root project files to a PHP host or XAMPP's `htdocs` directory.
2. Copy `config.example.php` to `config.php` and set the SMTP email, Gmail app password, and receiving email.
3. Start Apache and open the project URL. On production hosting, enable HTTPS.
4. Verify both enquiry validation and successful SMTP delivery before relying on the form.

`config.php` is private and ignored by Git at every directory level. Upload it separately to the PHP host. Keep `.htaccess` so direct access to configuration and Git files is blocked on Apache.
