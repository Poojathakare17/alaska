<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
  <title>{{ t(c('dashboardTitle')) }}</title>
  <script>
    var PREFIX = '{{ prefix }}';
  </script>
  <meta name="renderer" content="webkit">
  <style>
    html, body {
      display: block;
      padding: 0;
      margin: 0;
      background: #eaf0f5;
    }

    .boot-loading {
      margin: 100px auto 0;
      text-align: center;
      color: #00bcd4;
      font-size: 16px;
      background: #eaf0f5;
    }
  </style>
  <link href="{{ prefix }}/css/admin.css" rel="stylesheet">
</head>
<body>
<div id="viewport">
  <div class="boot-loading">Loading...</div>
</div>

{% if env=='production' %}
  <script type="application/javascript" src="{{ prefix }}/js/app.min.js"></script>
{% else %}
  <script type="application/javascript" src="{{ prefix }}/js/app.js"></script>
{% endif %}
</body>
</html>
