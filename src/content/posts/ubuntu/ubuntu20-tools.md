---
title: Ubuntu 工具软件配置笔记
published: 2026-06-24
updated: 2026-06-24
description: 包含开发、系统、代理、模拟器、容器类软件配置记录（Clash 仅说明不存档）
image: /assets/bolg_cover/ubuntu20-tools.webp
tags: [Ubuntu, 软件配置, 开发工具]
category: ubuntu
draft: false
author: larry
password: ""
passwordHint: ""
---

>备注：Clash的这个过时了，并且官网没有了可以利用别的软件；其余 AppImageTool、Java11、Qt Creator、搜狗输入法、Timeshift、Wine-runner、Android Studio、Docker 完整配置步骤留存。

> 详细的、或者那里不懂的可以查询原来的文档或者重新查阅资料和问AI。

# 1. Android Studio

![image-20260624105620889](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624105622015.webp)

**安卓App开发工具**

- **官方网站**
  - https://developer.android.google.cn/studio?hl=zh-cn
  - https://blog.csdn.net/Spontaneous_0/article/details/141497121（参考配置）
- **安装命令**
  - 安装的前提是必须保证安装了jdk1.8版本以上
  - 直接运行 **`studio.sh`**
- **卸载命令**
  - 1、删除对应文件夹
  - 2、删除 **`.local/share/applications/`** 目录下的快捷方式

## a. 配置

### i. SDK

1. 启动Android Studio，弹出导入设置文件的界面，直接选择Do not import settings，如图：

![image-20260624112409329](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112409456.webp)

- 如果本地有设置文件，选择 `Config or installation folder`

- 如果本地没有设置文件，选择 `Do not import settings`


2. 点击OK，跳转到 Data Sharing 界面，根据自己用途选择，我这里选择 Don’t send，如图：

![image-20260624112554207](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112554335.webp)

3. 点击Don’t send，弹出找不到SDK的界面，如图：

![image-20260624112611841](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112611979.webp)

4. 点击Cancel，跳转到AS的安装向导界面，如图：

![image-20260624112754219](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112754343.webp)

5. 点击Next，跳转到安装类型界面，可以选择标准按装，也可以选择自定义安装，默认选择标准安装，我这里选择自定义安装，如图：

![image-20260624112807668](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112807784.webp)

6. 点击Next，跳转到JDK的路径选择界面，默认选择，如图：

![image-20260624112849830](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624112850596.webp)

7. 点击Next，确认安装配置界面，如图：

![image-20260624113022821](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624113022951.webp)

8. 接下来 点击接受协议 完成，等待安装完成

![image-20260624113038405](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624113038556.webp)

9. 点击Finish，弹出以下界面表示安装完成，如图：

![image-20260624113047847](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624113047995.webp)

### ii. build.gradle

[参考网址](https://blog.csdn.net/2401_83566316/article/details/142915080)

项目根目录下的 `build.gradle`

```groovy
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        jcenter()}

    dependencies {
        classpath "com.android.tools.build:gradle:4.1.3"}
}

allprojects {
    repositories {
        google()
        jcenter()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

改为以下内容填充

```groovy
//顶级构建文件，您可以在其中添加所有子项目/模块通用的配置选项。
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/repository/public' }
    }

    dependencies {
        classpath "com.android.tools.build:gradle:4.1.3"
    }
}

allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/jcenter' }
        maven { url 'https://maven.aliyun.com/repository/public' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

### iii. JVM 内存

[参考网址](https://developer.android.google.cn/studio/intro/studio-config?hl=fi)

### iv. 代理

~~这个不知道怎么弄，他弹出来的，可以系统设置搜索 proxy~~

**gradle.properties** 文件添加对应端口号

```bash
## For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html
#
# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value: -Xmx1024m -XX:MaxPermSize=256m
# org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
#
# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true
#Thu Nov 28 17:57:31 CST 2024
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=8080
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=8080
```

### v、adb 调试

**android adb 直接调试真机**

- 参考：

  - https://blog.csdn.net/weixin_42176639/article/details/104743456

  - https://developer.android.com/studio/run/device?hl=zh-cn

    - ```bash
      sudo apt-get install android-sdk-platform-tools-common
      ```


```bash
sudo apt-get install android-tools-adb
```

## b. 结论

**Gradle 以后固定使用7.4.2版本**

先下载的最新版 `Android Studio 24-02-01` ，但是打开UI xml文件 闪退，又换回版本 `Android Studio 22-03-01`，但是软件的UI界面就固定这样了，反正能用了（应该是配置文件的原因）。

![image-20260624115147699](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624115148002.webp)

# 2. AppImageTool

![image-20260624105658667](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624105658763.webp)

**AppImage Linux下的打包工具**

- **官方网站**
  - https://appimage.org/
  - https://github.com/AppImage/appimagetool/releases/tag/continuous（新版）
  - https://github.com/AppImage/AppImageKit（旧版）
  - https://github.com/AppImage/appimagetool?tab=readme-ov-file
- **安装命令**
  - 直接运行 `.appImage文件`
- **卸载命令**
  - 删除对应文件夹

学习参考示例：https://www.cnblogs.com/jackie-astro/p/15021341.html

**appimagetool**  脚本文件

```bash
#!/bin/bash

# 设置 appimagetool 工具路径（以实际路径为主）
APPIMAGE_TOOL="$HOME/视频/Appimagetool/appimagetool-x86_64.AppImage"

# ANSI 色彩
RESET='\033[0m'
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'

# 检查 appimagetool 是否存在
echo -e "${CYAN}正在检查 appimagetool 工具...${RESET}"
if [[ ! -f "$APPIMAGE_TOOL" ]]; then
    echo -e "${RED}❌ 错误: appimagetool 工具未找到，请确保路径正确！${RESET}"
    exit 1
fi
echo -e "${GREEN}✅ 找到 appimagetool 工具: $APPIMAGE_TOOL${RESET}"

# 检查是否提供了应用目录参数
if [[ $# -lt 1 ]]; then
    echo -e "${RED}❌ 错误: 请提供应用程序目录路径作为参数。${RESET}"
    echo -e "用法示例: $0 <应用目录路径> [额外参数]"
    exit 1
fi

# 获取应用目录路径
app_dir="$1"
app_dir=$(realpath "$app_dir")

# 检查应用目录是否存在
echo -e "${CYAN}正在检查应用目录: $app_dir ...${RESET}"
if [[ ! -d "$app_dir" ]]; then
    echo -e "${RED}❌ 错误: 目录 $app_dir 不存在，请检查路径是否正确！${RESET}"
    exit 1
fi
echo -e "${GREEN}✅ 目录 $app_dir 存在${RESET}"

# 提示用户选择架构
echo -e "\n${YELLOW}请选择目标架构：${RESET}"
echo -e "1) 64 位 Intel (x86_64)"
echo -e "2) 64 位 ARM (aarch64)"
echo -e "3) 32 位 Intel (i686)"
echo -e "4) 32 位 ARM (armhf)"

read -p "请输入数字 (1-4): " arch_choice

# 根据用户输入设置架构
case $arch_choice in
    1)
        ARCH="x86_64"
        echo -e "${GREEN}选择架构: 64 位 Intel (x86_64)${RESET}"
        ;;
    2)
        ARCH="aarch64"
        echo -e "${GREEN}选择架构: 64 位 ARM (aarch64)${RESET}"
        ;;
    3)
        ARCH="i686"
        echo -e "${GREEN}选择架构: 32 位 Intel (i686)${RESET}"
        ;;
    4)
        ARCH="armhf"
        echo -e "${GREEN}选择架构: 32 位 ARM (armhf)${RESET}"
        ;;
    *)
        echo -e "${RED}❌ 无效的输入，请选择 1 到 4 之间的数字。${RESET}"
        exit 1
        ;;
esac

# 获取额外参数（例如 --no-desktop，--no-icon 等）
extra_params="${@:2}"
if [[ -n "$extra_params" ]]; then
    echo -e "${YELLOW}✅ 检测到额外参数: $extra_params${RESET}"
fi

# 设置输出目录为 "打包文件夹"（在 AppDir 下创建 build 文件夹）
output_dir="$app_dir/build"

# 如果 "build" 目录不存在，则创建它
if [[ ! -d "$output_dir" ]]; then
    echo -e "${CYAN}创建输出目录: $output_dir ...${RESET}"
    mkdir -p "$output_dir"
fi

# 打印 appimagetool 常用参数说明
echo -e "\n${BLUE}⚙️  appimagetool 的常用参数说明：${RESET}"
cat <<EOF
  ${BOLD}--no-desktop${RESET}           不生成桌面条目文件
  ${BOLD}--no-icon${RESET}              不生成应用图标
  ${BOLD}--no-appstream${RESET}         不生成 AppStream 元数据
  ${BOLD}--no-compression${RESET}       不压缩 AppImage 文件
  ${BOLD}--compress${RESET}             压缩 AppImage 文件（默认）
  ${BOLD}--help${RESET}                 显示帮助信息
  ${BOLD}--version${RESET}              显示版本信息
EOF

# 提示用户是否继续打包
echo -e "\n${YELLOW}🛠️  如果确认打包，请按回车继续；否则按 Ctrl+C 取消。${RESET}"
read -r  # 等待用户确认

# 切换到输出目录并执行打包操作
echo -e "\n${CYAN}正在打包应用: $app_dir ...${RESET}"
echo "$output_dir"
cd "$output_dir"
rm *
echo -e "已删除原有文件！"
echo -e "${GREEN}------------------------------------------------------------${RESET}"
ARCH="$ARCH" "$APPIMAGE_TOOL" "$app_dir" $extra_params
echo -e "${GREEN}------------------------------------------------------------${RESET}"

# 检查打包是否成功
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ 打包成功！应用已成功生成 AppImage 文件。${RESET}"
else
    echo -e "${RED}❌ 打包失败！请检查错误信息并重试。${RESET}"
fi
```

# 3. Clash

![image-20260624105725096](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624105725204.webp)

**VPN 工具**

- **官方网站**
  - 官方网站已经跑路了（或者别的原因）
  - [百度网盘_Clash(将三个文件夹内容放在一个中)](https://pan.baidu.com/s/1tEZWP1yjNqJOtnroDOA47A?pwd=sbsh)
    相关配置可以查看原`本地文档`或者`语雀的Ubuntu章节`

- **其他的**
  - **[clash-verge-rev](https://github.com/clash-verge-rev/clash-verge-rev)**
  - **[FlClash](https://github.com/chen08209/FlClash/releases)**
    这个最新版本只适用Ubuntu22+，Windows不受影响

# 4. Docker

![th](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624110226079.webp)

## a. 安装

### i. 离线安装

#### 1. 提前下载2类文件

- Docker二进制离线包

  - 固定版本下载：https://download.docker.com/linux/static/stable/x86_64/docker-20.10.6.tgz
  - 自选其他版本入口：https://download.docker.com/linux/static/stable/

- 离线安装脚本 Jrohy/docker-install

  - 项目地址：https://github.com/Jrohy/docker-install/

    下载方式：
    1. 打开链接，点击右上角绿色「Code」按钮
    2. 选择「Download ZIP」下载完整压缩包
    3. 解压后取出核心文件 `install.sh`

#### 2. 服务器上传部署

```bash
# 创建存放目录
mkdir -p /root/setup/docker
```

将 docker-20.10.6.tgz、install.sh 上传到此目录。

#### 3. 执行离线安装

```bash
# 进入目录
cd /root/setup/docker

# 赋予脚本执行权限
chmod +x install.sh

# 指定离线包安装
./install.sh -f docker-20.10.6.tgz
```

#### 4. 安装成功标识

终端输出以下内容即完成：

```bash
Created symlink from /etc/systemd/system/multi-user.target.wants/docker.service to /usr/lib/systemd/system/docker.service.
docker 20.10.6 install success!
```

#### 5. 验证 Docker

```bash
docker info
```

### ii. 一键在线安装

鱼香 ROS 一键脚本，自动配置源、镜像加速。

```bash
wget http://fishros.com/install -O fishros && . fishros

# 执行后按终端菜单提示，选择 Docker 安装即可。
# 验证，运行
docker info
```

## b. 加速服务器

**配置镜像下载阿里云加速服务器**

打开阿里云登陆网站，搜索**容器镜像服务**，点击**立即开通**，按照提示进行修改即可

---

[grid]
![image-20260624141732738](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624141733013.webp)
![image-20260624141750550](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624141750799.webp)
[/grid]

---

## c. 学习

### i. 常用命令

官方命令文档：https://docs.docker.com/reference/

CSDN（md文件内容）查看：https://blog.csdn.net/selectDele/article/details/121777901#t28

菜鸟：https://www.runoob.com/docker/docker-command-manual.html

### ii.文档

- **学习文档-狂神说**
  - [Docker上](https://1831996731.share.123pan.cn/123pan/wdzVjv-sKz6v)
  - [Docker下](https://1831996731.share.123pan.cn/123pan/wdzVjv-j2ryv)

### iii. Nginx镜像的安装

**1. 搜索Nginx镜像**

```shell
 #可以去官网上查询https://registry.hub.docker.com/
larry@larry:~$ sudo docker search nginx
NAME                                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
nginx                                             Official build of Nginx.                        17916     [OK]       
linuxserver/nginx                                 An Nginx container, brought to you by LinuxS…   182               
```

**2. 启动(下载)Nginx镜像**

```shell
larry@larry:~$ sudo docker pull nginx
Using default tag: latest
latest: Pulling from library/nginx
a2abf6c4d29d: Pull complete 
a9edb18cadd1: Pull complete 
589b7251471a: Pull complete 
186b1aaa4aa6: Pull complete 
b4df32aa5a72: Pull complete 
a0bcbecc962e: Pull complete 
Digest: sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31
Status: Downloaded newer image for nginx:latest
docker.io/library/nginx:latest
```

**3. 查看Nginx镜像**

```shell
larry@larry:~$ sudo docker images 
REPOSITORY      TAG       IMAGE ID       CREATED         SIZE
nginx           latest    605c77e624dd   12 months ago   141MB
```

**4. 启动Nginx镜像**

```shell
##启动docker中的nginx，改名为nginx01，端口映射为容器内部80映射为外部3344
larry@larry:~$ sudo docker run -d --name nginx01 -p 3344:80 nginx
f44d3b5435f1b86575187ffb6c9e5b419a664f80142f3fc9651dacfbbff91eb0
```

**5. 查看Nginx镜像**

```shell
#查询docker运行状态
larry@larry:~$ sudo docker ps 
CONTAINER ID   IMAGE     COMMAND                  CREATED              STATUS              PORTS                                   NAMES
f44d3b5435f1   nginx     "/docker-entrypoint.…"   About a minute ago   Up About a minute   0.0.0.0:3344->80/tcp, :::3344->80/tcp   nginx01
```

**6. 测试**

```shell
  #访问容器中的nginx项目
larry@larry:~$ curl localhost:3344
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

**端口暴露概念图：**

![image-20260624142356742](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624142357025.webp)



# 5. Java 11

![OIP](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624110347985.webp)

**Java 11**

- **官方网站**
  - http://www.oracle.com/technetwork/java/javase/downloads/index.html
- **安装命令**
  -  解压安装包到对应文件夹
- **卸载命令**
  - 1、删除对应文件夹

需要再 **.bashrc** 文件中配置一下环境，在其中加上以下内容

```bash
# >>> java    jdk-11.0.25  >>>                                                            
export JAVA_HOME=/home/k-on/视频/jdk-11.0.25
export JRE_HOME=${JAVA_HOME}/jre                                                              
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib                                           
export PATH=${JAVA_HOME}/bin:$PATH                                                       
# <<<  java    jdk-11.0.25  <<< 
```

**验证**

```bash
k-on@k-on:~$ java -version
java version "11.0.25" 2024-10-15 LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.25+9-LTS-256)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.25+9-LTS-256, mixed mode)
```

# 6. Qt Creator

![OIP (1)](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624111916374.webp)





# 7. SoGouPinYin

![image-20260624110618300](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624110618399.webp)

**SoGouPinYin 搜狗输入法**

- **官方网站**
  - https://shurufa.sogou.com/?r=mac&t=pinyin
- **安装命令**
  - `sudo dpkg -i 安装包路径`
- **卸载命令**
  - `sudo dpkg -r sogoupinyin`

这个安装需要 **fcitx 依赖**，~~标准配置的话官方有网站：https://shurufa.sogou.com/linux/guide~~，官方的弄完，搜狗调用不了。参考网上的弄了一下，缺了几个组件没下载。

[参考链接（这篇文章是付费资源，可以查看原来的文档进行配置）](https://blog.csdn.net/qq_20016593/article/details/127604068?ops_request_misc=&request_id=&biz_id=102&utm_term=%E6%90%9C%E7%8B%97%E8%BE%93%E5%85%A5%E6%B3%95&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-4-127604068.142^v100^control&spm=1018.2226.3001.4187)

# 8. Timeshift

![image-20260624110633818](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624110633889.webp)

**timeshif 系统备份工具**

- **官方网站**
  - 这个没找到
- **安装命令**
  - `sudo apt-add-repository -y ppa:teejee2008/ppa`
    `sudo apt-get update`
    `sudo apt-get install timeshift`
- **卸载命令**
  - `sudo apt-get remove timeshift` （不删除依赖）
  - `sudo apt-get autoremove --purge timeshift` （删除依赖，但是系统中的其他软件所依靠的依赖也可能被删除）

这个的配置网上很多，这里给一个[参考链接](https://blog.csdn.net/wf19930209/article/details/104236358)，备份的文件还是跟Ubuntu 18.04一样，放在了 **/home** 文件夹下,下面的 **sdb4**分区就是 **/home** 文件夹。

----

[grid]
![image-20260624135129542](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624135129933.webp)
![image-20260624135149737](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624135149926.webp)
[/grid]

----

# 9. Typora

激活的

[Yporaject_init.zip](https://1831996731.share.123pan.cn/123pan/wdzVjv-R9Lyv)

::github{repo="liheji/Yporaject "}



# 10. Wine-runner

![image-20260624110703271](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624110703389.webp)

**wine的可视化 Windows软件运行器**

- **官方网站**
  - Gitee（deb）：https://gitee.com/gfdgd-xi/deep-wine-runner
  - Github（deb、pkg、rpm）：[https://github.com/gfdgd-xi/deep-wine-runner](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fgfdgd-xi%2Fdeep-wine-runner)
  - Sourceforge（deb、pkg、rpm）：[https://sourceforge.net/projects/deep-wine-runner/files/](https://gitee.com/link?target=https%3A%2F%2Fsourceforge.net%2Fprojects%2Fdeep-wine-runner%2Ffiles%2F)
  - 蓝奏云（deb、rpm）：[https://gfdgdxi.lanzouj.com/b01nz7y3e，密码:7oii](https://gitee.com/link?target=https%3A%2F%2Fgfdgdxi.lanzouj.com%2Fb01nz7y3e%EF%BC%8C%E5%AF%86%E7%A0%81%3A7oii)
- **安装命令**
  - `sudo dpkg -i 安装包路径`
  - 可能提示缺依赖，执行 `sudo apt-get install -f` 后，重新安装
- **卸载命令**
  - `sudo dpkg -r spark-deepin-wine-runner`

这个是作者将**Wine**的操作可视化了，适合小白使用，主要是使用右边的**Wine运行器**，左边的是创建 **Qemu** 虚拟机的。

> 将左边的“开启 Windows 虚拟机”去掉了：
>
> sudo mv '/usr/share/applications/spark-deepin-wine-runner-start-vm.desktop' '/usr/share/applications/spark-deepin-wine-runner-start-vm.desktop.apk'

这个的卸载只卸载了这个软件包本身，如果后续通过**Wine**安装软件的话，估计是在别的地方，等弄清楚了以后规定到一个地方去。

## a. 安装Wine

使用了这个程序安装了**WineHQ** 版本，大约1.7G文件内容。

![image-20260624135716836](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624135717251.webp)

Wine 容器位置位于 **`/home/k-on/.wine`**，

## b. PVZ_RH

**PVZ_RH 植物大战僵尸融合版**

- **官方网站**
  - https://space.bilibili.com/3546619314178489/dynamic
- **安装命令**
  - Windows下 直接运行 **.exe** 文件
  - Linux 使用 **Wine** 命令启动
- **卸载命令**
  - 1、删除对应文件夹
  - 2、删除 **.local/share/applications/** 目录下的快捷方式

![image-20260624140002025](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624140002365.webp)

按照图片中的设置，用来在窗口聚焦时，Wine 使用键盘。

![image-20260624135946818](https://vip.123pan.cn/1831996731/a_PicBed/ubuntu/ubuntu20-tools/20260624135947182.webp)































































































