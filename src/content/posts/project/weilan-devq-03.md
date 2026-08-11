---
title: WEILAN 机器狗（三）
published: 2025-09-22
updated: 2026-08-12
description: 蔚蓝机器狗的自动导航
image: /assets/bolg_cover/weilan-devq-00.webp
tags: [机器狗, ROS, 自动导航]
category: 项目
draft: false
author: larry
password: ""
passwordHint: ""
---

---

# 前言

**[WEILAN 机器狗（一）](/posts/project/weilan-devq-01/)**

**[WEILAN 机器狗（二）](/posts/project/weilan-devq-02/)**

> 

Github：[AlphaDogDeveloper](https://github.com/AlphaDogDeveloper)

[原文档PDF原件](https://1831996731.share.123pan.cn/123pan/wdzVjv-jgWvd)

- **基础环境**

  | **主机设备**   | Jetson Nano                                                  |
  | -------------- | ------------------------------------------------------------ |
  | **操作系统**   | Ubuntu 20.04 LTS                                             |
  | **传感器设备** | 思岚 A1M8                                                    |
  | **ROS版本**    | ROS Noetic Ninjemys                                          |
  | **补充说明**   | 本环境为项目/测试的基础运行环境，后续所有操作均基于此环境开展，若环境有变更，需在文档中同步更新。 |

- **参考链接**

  | **产品名称**                   |                     **BabyAlpha Dev-Q**                      |
  | :----------------------------- | :----------------------------------------------------------: |
  | **agentos_sdk wiki**           |  **https://github.com/AlphaDogDeveloper/agentos_sdk/wiki**   |
  | **操作指引**                   |   **https://weilan.dochelp.cn/c/1681563736140279810.html**   |
  | **Github issues**              | **https://github.com/AlphaDogDeveloper/dev_robot_control_sdk/issues/created_by/21%20%20%20---%20Open?q=is%3Aissue** |
  | **dev_robot_control_sdk-main** | **[AlphaDogDeveloper/dev_robot_control_sdk: SDK for developing motion control software on WeiLan Dev series robots.](https://github.com/AlphaDogDeveloper/dev_robot_control_sdk)** |
  | **tools-main**                 | **[AlphaDogDeveloper/tools: burn tool, guides, etc.](https://github.com/AlphaDogDeveloper/tools)** |
  | **robodog**                    | **[00make/robodog: A Python library for controlling AlphaDog robotic dogs.](https://github.com/00make/robodog)** |
  | **alphadog_ros_ctl**           | **[alphadog_ros_ctl: 蔚蓝机器狗dev版本使用ros1 bridge连通ROS Humble和ROS Noetic，实现Joystick手柄遥控操作机器狗。](https://gitee.com/chenxin852/alphadog_ros_ctl)** |
  | **agentos** 的一个新的文档     | **[安装指南 — agentos 0.1 文档](https://agentos.readthedocs.io/zh-cn/latest/user_guide/installation.html)** |
  | 相关视频                       | **[二次开发机器狗学习分享_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1PvVZzQEGc?buvid=XY729C870210667572C0A4E453592000FE96B&from_spmid=search.search-result.0.0&is_story_h5=false&mid=XKX9a9aSqYtdWnp9LA7rtg%3D%3D&plat_id=116&share_from=ugc&share_medium=android&share_plat=android&share_session_id=c5afb3dd-fd5f-4013-87f9-5a87d55434f5&share_source=WEIXIN&share_tag=s_i&spmid=united.player-video-detail.0.0&timestamp=1757478588&unique_k=ehKXAKf&up_id=1128287275&vd_source=44174cb9e1b481198e2339e3ef279079)** |
