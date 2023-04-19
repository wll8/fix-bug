#!/usr/bin/env node

const os = require(`os`)
const cp = require(`child_process`)
const crypto = require('crypto') 
const lz = require(`lz-string`)
const FormData = require("form-data");
const pidusage = require('pidusage')
const Table = require('cli-table')
const logUpdate = require('log-update')

const fs = require(`fs`)
const tress = require('tress')
const PATH = require('path')
const chokidar = require('chokidar')
const throttle = require('lodash/throttle')
const findRoot = require('find-root')
const ignore = require('ignore')
const globby = require('globby')
const { isText, getEncoding } = require('istextorbinary')

console.log(`hello`)