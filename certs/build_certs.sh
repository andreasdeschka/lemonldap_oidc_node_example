# Generate a unique private key (KEY)
openssl genrsa -out mydomain.key 2048

# Generating a Certificate Signing Request (CSR)
openssl req -new -key mydomain.key -out mydomain.csr \
-subj "/C=US/ST=Utah/L=Lehi/O=Your Company, Inc./OU=IT/CN=yourdomain.com"

# Creating a Self-Signed Certificate (CRT)
openssl x509 -req -days 365 -in mydomain.csr -signkey mydomain.key -out mydomain.crt

# Append KEY and CRT to mydomain.pem
rm mydomain.pem
bash -c 'cat mydomain.key mydomain.crt >> mydomain.pem'

