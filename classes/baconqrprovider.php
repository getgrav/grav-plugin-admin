<?php
namespace Grav\Plugin\Admin;

use BaconQrCode\Renderer\Image\Png as BaconPng;
use BaconQrCode\Writer as BaconWriter;
use RobThree\Auth\Providers\Qr\IQRCodeProvider;

class BaconQRProvider implements IQRCodeProvider
{
    public function getMimeType()
    {
        return 'image/png';
    }

    public function getQRCodeImage($qrtext, $size = 256)
    {
        $renderer = new BaconPng();
        $renderer->setHeight($size);
        $renderer->setWidth($size);
        $writer = new BaconWriter($renderer);
        $result = $writer->writeString($qrtext);

        return $result;
    }
}
