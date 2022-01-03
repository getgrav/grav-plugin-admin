# laminas-xml

> This package is considered feature-complete, and is now in **security-only** maintenance mode, following a [decision by the Technical Steering Committee](https://github.com/laminas/technical-steering-committee/blob/2b55453e172a1b8c9c4c212be7cf7e7a58b9352c/meetings/minutes/2020-08-03-TSC-Minutes.md#vote-on-components-to-mark-as-security-only).
> If you have a security issue, please [follow our security reporting guidelines](https://getlaminas.org/security/).
> If you wish to take on the role of maintainer, please [nominate yourself](https://github.com/laminas/technical-steering-committee/issues/new?assignees=&labels=Nomination&template=Maintainer_Nomination.md&title=%5BNOMINATION%5D%5BMAINTAINER%5D%3A+%7Bname+of+person+being+nominated%7D)


[![Build Status](https://github.com/laminas/laminas-xml/workflows/Continuous%20Integration/badge.svg)](https://github.com/laminas/laminas-xml/actions?query=workflow%3A"Continuous+Integration")

An utility component for XML usage and best practices in PHP

## Installation

You can install using:

```bash
$ curl -s https://getcomposer.org/installer | php
$ php composer.phar install
```

Notice that this library doesn't have any external dependencies, the usage of composer is for autoloading and standard purpose.

## Laminas\Xml\Security

This is a security component to prevent [XML eXternal Entity](https://www.owasp.org/index.php/XML_External_Entity_%28XXE%29_Processing) (XXE) and [XML Entity Expansion](http://projects.webappsec.org/w/page/13247002/XML%20Entity%20Expansion) (XEE) attacks on XML documents.

The XXE attack is prevented disabling the load of external entities in the libxml library used by PHP, using the function [libxml_disable_entity_loader](http://www.php.net/manual/en/function.libxml-disable-entity-loader.php).

The XEE attack is prevented looking inside the XML document for ENTITY usage. If the XML document uses ENTITY the library throw an Exception.

We have two static methods to scan and load XML document from a string (scan) and from a file (scanFile). You can decide to get a SimpleXMLElement or DOMDocument as result, using the following use cases:

```php
use Laminas\Xml\Security as XmlSecurity;

$xml = <<<XML
    <?xml version="1.0"?>
    <results>
        <result>test</result>
    </results>
    XML;

// SimpleXML use case
$simplexml = XmlSecurity::scan($xml);
printf ("SimpleXMLElement: %s\n", ($simplexml instanceof \SimpleXMLElement) ? 'yes' : 'no');

// DOMDocument use case
$dom = new \DOMDocument('1.0');
$dom = XmlSecurity::scan($xml, $dom);
printf ("DOMDocument: %s\n", ($dom instanceof \DOMDocument) ? 'yes' : 'no');
```
