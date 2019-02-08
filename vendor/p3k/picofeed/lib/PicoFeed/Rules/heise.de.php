<?php
return array(
    'grabber' => array(
        '%^/tp.*%' => array(
            'test_url' => 'https://www.heise.de/tp/features/Macrons-Vermoegenssteuer-Der-Staat-verzichtet-auf-3-2-Milliarden-3863931.html',
            'body' => array(
                '//main/article'
            ),
            'strip' => array(
                '//header',
                '//aside',
                '//nav[@class="pre-akwa-toc"]',
                '//*[@class="seite_zurueck"]',
                '//*[@class="pagination"]',
                '//a[@class="kommentare_lesen_link"]',
                '//div[contains(@class, "shariff")]',
                '//a[@class="beitragsfooter_permalink"]',
                '//a[@class="beitragsfooter_fehlermelden"]',
                '//a[@class="beitragsfooter_printversion"]'
            ),
            'next_page' => array(
                '//a[@class="seite_weiter"]'
            ),
        ),
        '%^/newsticker/meldung.*%' => array(
            'test_url' => 'https://www.heise.de/newsticker/meldung/DragonFly-BSD-5-0-mit-experimentellem-HAMMER2-veroeffentlicht-3864731.html',
            'body' => array(
                '//div[@class="article-content"]',
            ),
            'strip' => array(
                '//*[contains(@class, "gallery")]',
                '//*[contains(@class, "video")]',
            ),
        ),
        '%^/autos/artikel.*%' => array(
            'test_url' => 'https://www.heise.de/autos/artikel/Bericht-Mazda-baut-Range-Extender-mit-Wankelmotor-3864760.html',
            'body' => array(
                '//section[@id="artikel_text"]'
            ),
            'strip' => array(
                '//p[@id="content_foren"]',
                '//div[contains(@class, "shariff")]',
                '//p[@class="permalink"]',
                '//p[@class="printversion"]'
            ),
        ),
        '%^/foto/meldung.*%' => array(
            'test_url' => 'https://www.heise.de/foto/meldung/Wildlife-Fotograf-des-Jahres-Gewinnerbild-zeigt-getoetetes-Nashorn-3864311.html',
            'body' => array(
                '//div[@class="article-content"]'
            ),
        ),
        '%^/ct.*%' => array(
            'test_url' => 'https://www.heise.de/ct/artikel/Google-Pixel-2-und-Pixel-2-XL-im-Test-3863842.html',
            'body' => array(
                '//main/div[1]/div[1]/section'
            ),
            'strip' => array(
                '//header'
            )
        ),
        '%^/developer.*%' => array(
            'test_url' => 'https://www.heise.de/developer/meldung/Container-Docker-unterstuetzt-Kubernetes-3863625.html',
            'body' => array(
                '//div[@class="article-content"]'
            )
        ),
        '%.*%' => array(
            'test_url' => 'https://www.heise.de/mac-and-i/meldung/iOS-App-Nude-findet-mittels-ML-Nacktbilder-und-versteckt-sie-3864217.html',
            'body' => array(
                '//article/div[@class="meldung_wrapper"]',
            ),
            'strip' => array(
                '//*[contains(@class, "gallery")]',
                '//*[contains(@class, "video")]',
            ),
        ),
    ),
);
