<?php

namespace Composer;

use Composer\Semver\VersionParser;






class InstalledVersions
{
private static $installed = array (
  'root' => 
  array (
    'pretty_version' => '1.10.x-dev',
    'version' => '1.10.9999999.9999999-dev',
    'aliases' => 
    array (
    ),
    'reference' => 'a8bd391b7886f2330ce1f9906e46522125c69e47',
    'name' => 'getgrav/grav-plugin-admin',
  ),
  'versions' => 
  array (
    'composer/semver' => 
    array (
      'pretty_version' => '1.7.1',
      'version' => '1.7.1.0',
      'aliases' => 
      array (
      ),
      'reference' => '38276325bd896f90dfcfe30029aa5db40df387a7',
    ),
    'getgrav/grav-plugin-admin' => 
    array (
      'pretty_version' => '1.10.x-dev',
      'version' => '1.10.9999999.9999999-dev',
      'aliases' => 
      array (
      ),
      'reference' => 'a8bd391b7886f2330ce1f9906e46522125c69e47',
    ),
    'laminas/laminas-xml' => 
    array (
      'pretty_version' => '1.2.0',
      'version' => '1.2.0.0',
      'aliases' => 
      array (
      ),
      'reference' => '879cc66d1bba6a37705e98074f52a6960c220020',
    ),
    'laminas/laminas-zendframework-bridge' => 
    array (
      'pretty_version' => '1.1.1',
      'version' => '1.1.1.0',
      'aliases' => 
      array (
      ),
      'reference' => '6ede70583e101030bcace4dcddd648f760ddf642',
    ),
    'miniflux/picofeed' => 
    array (
      'replaced' => 
      array (
        0 => '0.1.35',
      ),
    ),
    'p3k/picofeed' => 
    array (
      'pretty_version' => 'v0.1.40',
      'version' => '0.1.40.0',
      'aliases' => 
      array (
      ),
      'reference' => '356fd66d48779193b10ac28532cb4a4e11bb801c',
    ),
    'scssphp/scssphp' => 
    array (
      'pretty_version' => 'v1.4.0',
      'version' => '1.4.0.0',
      'aliases' => 
      array (
      ),
      'reference' => 'f7c9088320e218ca42e4ef0074259a1ba24ec93a',
    ),
    'zendframework/zendxml' => 
    array (
      'replaced' => 
      array (
        0 => '1.2.0',
      ),
    ),
  ),
);







public static function getInstalledPackages()
{
return array_keys(self::$installed['versions']);
}









public static function isInstalled($packageName)
{
return isset(self::$installed['versions'][$packageName]);
}














public static function satisfies(VersionParser $parser, $packageName, $constraint)
{
$constraint = $parser->parseConstraints($constraint);
$provided = $parser->parseConstraints(self::getVersionRanges($packageName));

return $provided->matches($constraint);
}










public static function getVersionRanges($packageName)
{
if (!isset(self::$installed['versions'][$packageName])) {
throw new \OutOfBoundsException('Package "' . $packageName . '" is not installed');
}

$ranges = array();
if (isset(self::$installed['versions'][$packageName]['pretty_version'])) {
$ranges[] = self::$installed['versions'][$packageName]['pretty_version'];
}
if (array_key_exists('aliases', self::$installed['versions'][$packageName])) {
$ranges = array_merge($ranges, self::$installed['versions'][$packageName]['aliases']);
}
if (array_key_exists('replaced', self::$installed['versions'][$packageName])) {
$ranges = array_merge($ranges, self::$installed['versions'][$packageName]['replaced']);
}
if (array_key_exists('provided', self::$installed['versions'][$packageName])) {
$ranges = array_merge($ranges, self::$installed['versions'][$packageName]['provided']);
}

return implode(' || ', $ranges);
}





public static function getVersion($packageName)
{
if (!isset(self::$installed['versions'][$packageName])) {
throw new \OutOfBoundsException('Package "' . $packageName . '" is not installed');
}

if (!isset(self::$installed['versions'][$packageName]['version'])) {
return null;
}

return self::$installed['versions'][$packageName]['version'];
}





public static function getPrettyVersion($packageName)
{
if (!isset(self::$installed['versions'][$packageName])) {
throw new \OutOfBoundsException('Package "' . $packageName . '" is not installed');
}

if (!isset(self::$installed['versions'][$packageName]['pretty_version'])) {
return null;
}

return self::$installed['versions'][$packageName]['pretty_version'];
}





public static function getReference($packageName)
{
if (!isset(self::$installed['versions'][$packageName])) {
throw new \OutOfBoundsException('Package "' . $packageName . '" is not installed');
}

if (!isset(self::$installed['versions'][$packageName]['reference'])) {
return null;
}

return self::$installed['versions'][$packageName]['reference'];
}





public static function getRootPackage()
{
return self::$installed['root'];
}







public static function getRawData()
{
return self::$installed;
}



















public static function reload($data)
{
self::$installed = $data;
}
}
