# pown-apps [![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/pownjs/Lobby)

> Pown App Launcher

Pown App Launcher brings many security-related web applications in the context of the Pown framework. Currently, only [SecApps](https://secapps.com) applications are available. Please submit pull-requests to add additional apps.

## What are Pown Apps

Pown Apps is a paradigm shift in how we deploy, execute and interact with rich applications. Most security tools are stuck with rudimentary command-line interfaces. While undoubtfully useful and elegant, there are times when you need better tools to explore output interactively with very rich desktop applications.

With help of [SecApps](https://secapps.com), we pulled together a rich application environment which can interact with many pown commands and modules.

### Use Cases

The Pown Apps are compatible with standard command line concepts. Here are a few ideas how to use Pown Apps with the SecApps tools.

* Build interactive network map in Recon by processing PCAP files or a live sniff
* Use HTTPView to Preview and interact with any stream of HTTP traffic (captured live or from file) - automatic vulnerability detection is also possible
* Send HTTP requests from command line apps to rest to interact and rebuild dynamically using powerful UI controls
* Alternative to Wireshark using SecApps Packets app.
* Reverse-engineer binary files using BinView
* Automatic screenshots for web applications, VNC, RDP and other types of interactive sessions.

These are just a few of the use-cases Pown Apps make possible.

## Getting Started

You have a number of options when installing pown-apps.

### Install pown apps standalone

The package pown-apps can be run standalone:

```sh
$ npm install -g pown-apps
```

To use type:

```sh
$ pown-apps
```

### Install the pown distribution

The default pown distribution also contains pown-apps. To install pown:

```sh
$ npm install -g pown
```

To use type:

```sh
$ pown apps
```
