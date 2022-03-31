#!/bin/bash

KEY_DIR=./assets

openssl genrsa -out $KEY_DIR/rsa_1024_priv.pem 1024
openssl rsa -pubout -in $KEY_DIR/rsa_1024_priv.pem -out $KEY_DIR/rsa_1024_pub.pem
