#!/bin/bash

# Check if exactly one argument is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 {enc|dec} <passwd>"
    exit 1
fi

# The argument provided
cmd=$1
passwd=$2
enc_file=indexEncrypted.js
dec_file=index-dec.html

# Switch case based on the argument
case $cmd in
    enc)
        echo "Encrypting..."
        hello=`openssl enc -e -a -A -aes-256-cbc -k $passwd -md MD5 -in $dec_file`
	echo "var encryptedPage=\"$hello\";" > $enc_file
        ;;
    dec)
        echo "Decrypting..."
	file=`cat $enc_file`
	res="${file//var encryptedPage=\"/}"
	res="${res//\";/}"
	echo "$res" | openssl enc -e -d -a -A -aes-256-cbc -k $passwd -md MD5
        ;;
    *)
        echo "Invalid argument: $arg"
        echo "Usage: $0 {enc|dec} <passwd>"
        exit 1
        ;;
esac
