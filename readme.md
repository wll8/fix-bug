Getting error when using high-obfuscation parameter: `URIError: URI malformed`

```txt
D:\git2\javascript-obfuscator-fix\node_modules\javascript-obfuscator\dist\webpack:\javascript-obfuscator\src\utils\CryptUtils.ts:31
        string = encodeURIComponent(string).replace(/%([0-9A-F]{2})/g, (match, p1) => {
                 ^
URIError: URI malformed
    at encodeURIComponent (<anonymous>)
    at f.btoa (D:\git2\javascript-obfuscator-fix\node_modules\javascript-obfuscator\dist\webpack:\javascript-obfuscator\src\utils\CryptUtils.ts:31:18)
    at f.btoa (D:\git2\javascript-obfuscator-fix\node_modules\javascript-obfuscator\dist\webpack:\javascript-obfuscator\src\utils\CryptUtilsStringArray.ts:28:30)
```

## env

- win10 x64
- node 16.13.0
- javascript-obfuscator 4.0.2
- yarn 1.22.19

## step

Code to reproduce the problem: https://github.com/wll8/fix-bug/tree/javascript-obfuscator-fix-1165

```sh
# initialization code
git clone -b javascript-obfuscator-fix-1165 https://github.com/wll8/fix-bug && cd fix-bug && yarn

# no error
yarn build

# something went wrong
yarn build --string-array-encoding rc4
```

## possibly related questions

- https://github.com/javascript-obfuscator/javascript-obfuscator/issues/530
