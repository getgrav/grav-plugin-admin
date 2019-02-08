<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'http://www.westfalen-blatt.de/OWL/Lokales/Kreis-Hoexter/Warburg/3024113-Polizei-in-Warburg-Hier-waren-keine-kriminellen-Profis-am-Werk-Wurstautomat-Sprengung-mit-Polen-Boellern',
            'body' => array(
                '//div[contains(@class, "articleimage")]',
                '//div[@class="attribute-short"]',
                '//div[@class="attribute-long"]',
            ),
            'strip' => array(
                '//div[@class="fb-post"]'
            ),
        ),
    ),
);
