FROM php:7.1-apache

# add php-gd and php-zip
RUN rm /etc/apt/preferences.d/no-debian-php
RUN apt-get update
RUN apt-get install -y libpng-dev
RUN docker-php-ext-install gd zip 

# add apache mod rewrite
RUN a2enmod rewrite

# install app and add plugins
WORKDIR /var/www/html/
COPY . .
RUN ./bin/gpm install admin
RUN chown -R www-data. .
