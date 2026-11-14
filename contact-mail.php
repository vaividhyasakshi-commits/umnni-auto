
<?php

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');


/* RESPONSE HELPER */

function respond($status, $message, $code = 200)
{
    http_response_code($code);

    echo json_encode([
        'status' => $status,
        'message' => $message
    ]);

    exit;
}


/* ONLY POST REQUEST */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    respond(
        'error',
        'Invalid request method.',
        405
    );
}


/* GET FORM DATA */

function field($key)
{
    $value = $_POST[$key] ?? '';

    return is_string($value)
        ? trim($value)
        : '';
}

$name = field('name');
$email = field('email');
$phone = field('phone');
$service = field('service');
$message = field('message');

$formSource = field('form_source')
    ?: 'Auto Advertising Contact Form';


/* ALLOWED SERVICES */

$services = [

    'Rear Panel Advertising',

    'Side Panel Branding',

    'Hood Branding',

    'Full Auto Branding',

    'Fleet Advertising',

    'Complete Auto Advertising Campaign'

];


/* FORM VALIDATION */

if (
    strlen($name) < 3 ||
    strlen($name) > 150
) {

    respond(
        'error',
        'Please enter a valid name.',
        422
    );
}

if (
    strlen($email) > 254 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {

    respond(
        'error',
        'Please enter a valid email address.',
        422
    );
}

if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {

    respond(
        'error',
        'Please enter a valid mobile number.',
        422
    );
}

if (!in_array($service, $services, true)) {

    respond(
        'error',
        'Please select a valid advertising format.',
        422
    );
}

if (
    strlen($message) < 10 ||
    strlen($message) > 5000
) {

    respond(
        'error',
        'Please enter 10 to 5000 characters.',
        422
    );
}

if (strlen($formSource) > 150) {

    respond(
        'error',
        'Invalid form source.',
        422
    );
}


try {

    /* LOAD PHPMAILER */

    require_once __DIR__ . '/PHPMailer/Exception.php';

    require_once __DIR__ . '/PHPMailer/PHPMailer.php';

    require_once __DIR__ . '/PHPMailer/SMTP.php';


    /* LOAD PRIVATE CONFIG */

    $configFile = __DIR__ . '/config.php';

    if (!is_file($configFile)) {

        throw new \RuntimeException(
            'Missing SMTP configuration.'
        );
    }

    $config = require $configFile;

    $smtpEmail = $config['smtp_email'] ?? '';

    $smtpPassword = str_replace(
        ' ',
        '',
        $config['smtp_password'] ?? ''
    );

    $receiverEmail = $config['receiver_email'] ?? '';

    if (
        !filter_var($smtpEmail, FILTER_VALIDATE_EMAIL) ||
        !filter_var($receiverEmail, FILTER_VALIDATE_EMAIL) ||
        !$smtpPassword ||
        $smtpPassword === 'YOUR_GMAIL_APP_PASSWORD'
    ) {

        throw new \RuntimeException(
            'Invalid SMTP credentials.'
        );
    }


    /* PHPMAILER CONFIGURATION */

    $mail = new PHPMailer(true);

    $mail->isSMTP();

    $mail->Host = 'smtp.gmail.com';

    $mail->SMTPAuth = true;

    $mail->Username = $smtpEmail;

    $mail->Password = $smtpPassword;

    $mail->SMTPSecure =
        PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = 587;

    $mail->Timeout = 30;

    $mail->SMTPDebug = 0;

    $mail->CharSet = 'UTF-8';


    /* SENDER AND RECEIVER */

    $mail->setFrom(

        $smtpEmail,

        'UMNNI Advertising Website'

    );

    $mail->addAddress(

        $receiverEmail,

        'UMNNI Advertising'

    );

    $mail->addReplyTo(
        $email,
        $name
    );


    /* EMAIL SUBJECT */

    $mail->isHTML(true);

    $mail->Subject =
        'New Auto Advertising Lead | UMNNI Advertising | '
        . $service;


    /* EMAIL ROWS */

    $rows = '';

    $plain = "New Auto Advertising Lead\n\n";

    $details = [

        'Form Source' => $formSource,

        'Name' => $name,

        'Email' => $email,

        'Phone' => $phone,

        'Advertising Format' => $service,

        'Campaign Requirements' => $message

    ];

    foreach ($details as $label => $value) {

        $safe = nl2br(

            htmlspecialchars(

                $value,

                ENT_QUOTES | ENT_SUBSTITUTE,

                'UTF-8'

            )

        );

        $rows .= "

            <tr>

                <td style='
                    padding:14px;
                    background:#fff5ec;
                    border-bottom:1px solid #eeeeee;
                    width:190px;
                '>

                    <strong>{$label}</strong>

                </td>

                <td style='
                    padding:14px;
                    border-bottom:1px solid #eeeeee;
                '>

                    {$safe}

                </td>

            </tr>

        ";

        $plain .= "$label: $value\n";

    }


    /* EMAIL TEMPLATE */

    $mail->Body = "

        <div style='
            background:#f5f5f5;
            padding:25px;
            font-family:Arial,sans-serif;
        '>

            <div style='
                max-width:720px;
                margin:auto;
                background:#ffffff;
                border-radius:16px;
                overflow:hidden;
                border:1px solid #eeeeee;
            '>

                <div style='
                    background:#111111;
                    padding:28px;
                    border-bottom:5px solid #f27b21;
                '>

                    <h2 style='
                        color:#ffffff;
                        margin:0;
                    '>

                        New Auto Advertising Lead

                    </h2>

                    <p style='
                        color:#f27b21;
                        font-weight:bold;
                        margin:10px 0 0;
                    '>

                        UMNNI Advertising

                    </p>

                </div>

                <div style='padding:25px;'>

                    <table width='100%'
                           cellspacing='0'
                           cellpadding='0'
                           style='
                               border-collapse:collapse;
                               font-size:14px;
                           '>

                        {$rows}

                    </table>

                </div>

                <div style='
                    background:#111111;
                    color:#ffffff;
                    padding:20px;
                    font-size:13px;
                '>

                    UMNNI Advertising |
                    Auto Advertising Enquiry

                </div>

            </div>

        </div>

    ";

    $mail->AltBody = $plain;


    /* SEND MAIL */

    $mail->send();


    /* SUCCESS RESPONSE */

    respond(

        'success',

        'Lead submitted successfully.'

    );


} catch (\Throwable $e) {


    /* PRIVATE SERVER ERROR LOG */

    error_log(

        'UMNNI Auto Advertising Mailer: '

        . $e->getMessage()

    );


    /* PUBLIC ERROR RESPONSE */

    respond(

        'error',

        'Unable to submit your enquiry. Please try again.',

        500

    );

}
