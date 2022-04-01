#!/bin/bash

KEY_DIR=./assets

cd $KEY_DIR ;

[ -f rsa_1024_pub.pem ] && rm rsa_1024_pub.pem ;
[ -f rsa_1024_priv.pem ] && rm rsa_1024_priv.pem ;

cd .. ;

openssl genrsa -out $KEY_DIR/rsa_1024_pub.pem 1024 ;
openssl rsa -pubout -in $KEY_DIR/rsa_1024_priv.pem -out $KEY_DIR/rsa_1024_pub.pem ;
