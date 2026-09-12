<?php

function admin_hash_password(string $plain): string
{
    return password_hash($plain, PASSWORD_DEFAULT);
}

function admin_verify_password(string $plain, ?string $stored): bool
{
    return is_string($stored) && $stored !== '' && password_verify($plain, $stored);
}
