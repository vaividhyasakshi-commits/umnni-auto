<?php
use PHPMailer\PHPMailer\PHPMailer;
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
function respond($status, $message, $code=200) {
    http_response_code($code);
    echo json_encode(['status'=>$status,'message'=>$message]);
    exit;
}
function field($key) { $v=$_POST[$key]??''; return is_string($v)?trim($v):''; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond('error','Invalid request method.',405);
$name=field('name'); $email=field('email'); $phone=field('phone');
$service=field('service'); $message=field('message'); $source=field('form_source') ?: 'Auto Advertising Form';
$services=['Rear Panel Advertising', 'Side Panel Branding', 'Hood Branding', 'Full Auto Branding', 'Fleet Advertising', 'Complete Auto Advertising Campaign'];
if (strlen($name)<3 || strlen($name)>150 || strlen($email)>254 || !filter_var($email,FILTER_VALIDATE_EMAIL) || !preg_match('/^[6-9][0-9]{9}$/',$phone) || !in_array($service,$services,true) || strlen($message)<10 || strlen($message)>5000 || strlen($source)>150) respond('error','Please enter valid details and select a service.',422);
try {
    require_once __DIR__.'/PHPMailer/Exception.php';
    require_once __DIR__.'/PHPMailer/PHPMailer.php';
    require_once __DIR__.'/PHPMailer/SMTP.php';
    if (!is_file(__DIR__.'/config.php')) throw new \RuntimeException('Missing SMTP config');
    $config=require __DIR__.'/config.php';
    $password=str_replace(' ','',$config['smtp_password']??'');
    if (!$password || $password==='YOUR_GMAIL_APP_PASSWORD') throw new \RuntimeException('Missing SMTP password');
    $mail=new PHPMailer(true);
    $mail->isSMTP(); $mail->Host='smtp.gmail.com'; $mail->SMTPAuth=true;
    $mail->Username=$config['smtp_email']; $mail->Password=$password;
    $mail->SMTPSecure=PHPMailer::ENCRYPTION_STARTTLS; $mail->Port=587; $mail->Timeout=30; $mail->CharSet='UTF-8';
    $mail->setFrom($config['smtp_email'],'UMNNI Advertising Website');
    $mail->addAddress($config['receiver_email'],'UMNNI Advertising');
    $mail->addReplyTo($email,$name); $mail->isHTML(true);
    $mail->Subject='New Auto Advertising Lead | UMNNI Advertising | '.$service;
    $rows=''; $plain="New Auto Advertising Lead\n\n";
    foreach (['Form Source'=>$source,'Name'=>$name,'Email'=>$email,'Phone'=>$phone,'Service'=>$service,'Message'=>$message] as $label=>$value) {
        $safe=nl2br(htmlspecialchars($value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'));
        $rows.="<tr><td style='padding:12px;background:#fff5ec;border-bottom:1px solid #eee'><strong>$label</strong></td><td style='padding:12px;border-bottom:1px solid #eee'>$safe</td></tr>";
        $plain.="$label: $value\n";
    }
    $mail->Body="<div style='background:#f5f5f5;padding:24px;font-family:Arial'><div style='max-width:700px;margin:auto;background:white;border-radius:16px;overflow:hidden'><div style='background:#111;color:white;padding:24px;border-bottom:5px solid #f27b21'><h2>New Auto Advertising Lead</h2><p style='color:#f27b21'>UMNNI Advertising</p></div><table width='100%' cellspacing='0'>$rows</table><div style='background:#111;color:white;padding:20px'>UMNNI Advertising</div></div></div>";
    $mail->AltBody=$plain; $mail->send();
    respond('success','Lead submitted successfully.');
} catch (\Throwable $e) {
    error_log('UMNNI Auto Advertising mailer: '.$e->getMessage());
    respond('error','Unable to submit your enquiry. Please try again.',500);
}
