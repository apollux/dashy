# Dashy

> A configurable browser view to displays dashboards or other websites on the
> available monitors.

## Features

- Multi monitor aware
- Group urls to always be visible on the same monitor
- Configurable refresh interval per URL

## Installation

Installers can be downloaded here: https://github.com/apollux/dashy/releases
Alternatively you can build your own by cloning the repo and running:
`yarn && yarn run dist`

## Configuration

Configuration is done through a `config.json` file. On Linux this should be
placed at `~/.config/dashy/config.json` On Windows the this should be placed at
`%APPDATA%/dashy/config.json`.

The URLs to load can be configured in a couple of different ways.

### List of URLs to spread evenly over the available monitors

```json
{
  "urls": ["https://foo.bar", "https://foo.baz", "https://foo.bas"]
}
```

When a single monitor is available, the three URLs will rotate every 15s, on multiple monitors the URLs will be spread evenly over the available monitors and may rotate when needed.

### Group URLs to be on same monitor

```json
{
  "urls": [["https://foo.bar", "https://foo.baz"], "https://foo.bas"]
}
```

Regardless of the number of available monitors `foo.bar` and `foo.baz` will rotate on the same monitor.

### Auto refresh URL

```json
{
  "urls": [
    { "url": "https://foo.bar", "refreshInterval": 5000 },
    "https://foo.baz",
    "https://foo.bas"
  ]
}
```

This will refresh `foo.bar` every 5 seconds.

## Usage

The ControlWindow (`F12`) allows for pausing of cycling the pages and manually
stepping to a certain page. This allows for configuration or entering
credentials on a page.

The dev tools of open pages and the control window can be toggled with
`Ctrl+F12`
