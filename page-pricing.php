<?php
/**
 * Template Name: Pricing Dashboard
 * Template Post Type: page
 */

// Load the static pricing dashboard build without WordPress chrome
$dashboard_html = file_get_contents(
    WP_CONTENT_DIR . '/uploads/pricing-dashboard/index.html'
);

// Rewrite asset paths to point to uploaded build files
$dashboard_html = str_replace(
    '/pricing/assets/',
    '/wp-content/uploads/pricing-dashboard/assets/',
    $dashboard_html
);

echo $dashboard_html;
exit;
