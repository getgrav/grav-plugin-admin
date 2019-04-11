<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://cicero.de/innenpolitik/plaene-der-eu-kommission-der-ganz-normale-terror',
            'body' => array(
                '//p[@class="lead"]',
                '//article/div[2]/div[contains(@class, "field--name-field-cc-image")]',
                '//article/div[2]/div[contains(@class, "image-description")]',
                '//div[@class="field field-name-field-cc-body"]',
            ),
            'strip' => array(
                '//*[contains(@class, "urban-ad-sign")]'
            )
        ),
    ),
);
