<?php return array(
    'root' => array(
        'name' => 'getgrav/grav-plugin-admin',
        'pretty_version' => 'dev-develop',
        'version' => 'dev-develop',
        'reference' => '12bdb5af4bd10e30e24d191b7ea1a78602a583fb',
        'type' => 'grav-plugin',
        'install_path' => __DIR__ . '/../../',
        'aliases' => array(),
        'dev' => false,
    ),
    'versions' => array(
        'getgrav/grav-plugin-admin' => array(
            'pretty_version' => 'dev-develop',
            'version' => 'dev-develop',
            'reference' => '12bdb5af4bd10e30e24d191b7ea1a78602a583fb',
            'type' => 'grav-plugin',
            'install_path' => __DIR__ . '/../../',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'laminas/laminas-xml' => array(
            'pretty_version' => '1.4.0',
            'version' => '1.4.0.0',
            'reference' => 'dcadeefdb6d7ed6b39d772b47e3845003d6ea60f',
            'type' => 'library',
            'install_path' => __DIR__ . '/../laminas/laminas-xml',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'miniflux/picofeed' => array(
            'dev_requirement' => false,
            'replaced' => array(
                0 => '0.1.35',
            ),
        ),
        'p3k/picofeed' => array(
            'pretty_version' => '1.0.0',
            'version' => '1.0.0.0',
            'reference' => '8eacaa62f50a0935e26ca33f8d30d283344ca397',
            'type' => 'library',
            'install_path' => __DIR__ . '/../p3k/picofeed',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'scssphp/scssphp' => array(
            'pretty_version' => 'v1.13.0',
            'version' => '1.13.0.0',
            'reference' => '63d1157457e5554edf00b0c1fabab4c1511d2520',
            'type' => 'library',
            'install_path' => __DIR__ . '/../scssphp/scssphp',
            'aliases' => array(),
            'dev_requirement' => false,
        ),
        'symfony/polyfill-php73' => array(
            'dev_requirement' => false,
            'replaced' => array(
                0 => '*',
            ),
        ),
    ),
);
