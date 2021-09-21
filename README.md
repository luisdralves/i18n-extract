# i18n-extract

Adds empty entries to the locales files based on keys detected from the input files

## Example
Running the default arguments on this file:
```jsx
<div>
  <p>{translate('foo:bar')}</p>
  <p>{translate('foo:biz.wow')}</p>
  <p>{translate('bar:biz')}</p>
</div>
```

will append to the files `foo.json` and `bar.json` in each of the project's locales with the extracted keys:

`foo.json`
```json
{
  "bar": "",
  "biz": {
    "wow": ""
  }
}
```

`bar.json`
```json
{
  "biz": ""
}
```

If the files don't exist, they will be created.
