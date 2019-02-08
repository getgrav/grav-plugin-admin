<?php
return array(
    'grabber' => array(
        '%.*%' => array(
            'test_url' => 'https://www.novo-argumente.com/artikel/der_kampf_gegen_die_schlafkrankheit',
            'body' => array(
                '//main/div/article',
            ),
            'strip' => array(
                '//*[@class="artikel-datum"]',
                '//*[@class="artikel-titel"]',
                '//*[@class="artikel-autor"]',
            ),
        ),
    ),
);
