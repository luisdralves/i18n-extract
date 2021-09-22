#!/usr/bin/env node
'use strict';

const { ArgumentParser } = require('argparse');
const fs = require('fs')
const deepmerge = require('deepmerge')

const parser = new ArgumentParser({
  description: 'i18n extract usage'
});

parser.add_argument('-i', '--input', {
  help: 'input file to extract translation keys from',
  required: true
});
parser.add_argument('-o', '--output', {
  default: 'public/static/locales',
  help: 'output directory (locales)'
});
parser.add_argument('-m', '--marker', {
  default: 'translate',
  help: 'function name to detect'
});

const args = parser.parse_args();
const markerRE = new RegExp(args.marker+'\\(\'([\\w\\.:-]*?)\'\\)', 'g')

function setValue(obj, path, value) {
  var a = path.split('.')
  var o = obj
  while (a.length - 1) {
    var n = a.shift()
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  o[a[0]] = value
}

function updateJSON(o, locale, namespace, value) {
  fs.readFile(`${o}/${locale}/${namespace}.json`, 'utf8' , (err, data) => {
    let updatedData;
    if (err) {
      console.error(err)
      updatedData = (JSON.stringify(value, null, 2))
    } else {
      updatedData = (JSON.stringify(deepmerge(value, JSON.parse(data)), null, 2))
    }
    fs.writeFile(`${o}/${locale}/${namespace}.json`, updatedData, (err) => {
      if (err) {
        console.error(err)
      }
    });
  })
}

function extractFromFile(i, o, r) {
  fs.readFile(i, 'utf8' , (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    const keys = Array.from(data.matchAll(r)).map(([,match]) => match)
    const object = {}
    keys.forEach(key => {
      setValue(object, key.replace(':','.'), '')
    })
    fs.readdir(o, (err, locales) => {
      if (err) {
        console.error(err)
        return
      }
      locales.forEach(locale => {
        Object.keys(object).forEach(namespace => {
          updateJSON(o, locale, namespace, object[namespace])
        })
      })
    })
  })
}

if(fs.lstatSync(args.input).isDirectory()) {
  fs.readdir(args.input, (err, files) => {
    if (err) {
      console.error(err)
      return
    }
    files.forEach(file => {
      extractFromFile(args.input+'/'+file, args.output, markerRE)
    })
  })
} else {
  extractFromFile(args.input, args.output, markerRE)
}
