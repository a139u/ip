<div align="center">

[简体中文](README.md) | [English](README_EN.md)

</div>

<div align="center">

# 基于IP的真实地址生成器 🌍

</div>

这是一个基于Web的应用程序，可以根据IP地址生成真实的随机地址信息。它使用多个API来获取位置数据和随机用户信息，为您提供一个完整的虚拟身份。

## 访问地址

https://ip-geoaddress-generator.pages.dev/

## 主要功能

### 地址生成
- 自动检测当前IP地址生成
- 支持手动输入IP或自选地区生成
- 生成完整的随机地址信息
  - 姓名
  - 电话
  - 国家
  - 省/州
  - 城市
  - SSN（仅美国地区）

### 地址管理
- 在Google地图上显示生成的地址
- 一键复制各项信息
- 保存、搜索和删除地址
- 导出保存的地址为JSON文件

### 用户体验
- 响应式设计，适配多种设备
- 支持浅色/深色主题切换

## 部署

[Cloudflare部署](https://github.com/a139u/ip/blob/master/Cloudflare部署教程.md)

Docker部署

```bash
docker run -p 3000:3000 a139u/ip-geoaddress-generator:latest
```

## 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/a139u/ip.git
   ```

2. 安装依赖：
   ```bash
   cd ip-geoaddress-generator
   npm install
   ```

3. 运行开发服务器：
   ```bash
   npm dev
   ```

## 注意事项

- 本项目仅用于教育和娱乐目的
- 生成的地址信息是随机的，不应用于任何实际或法律用途
- 请遵守API使用条款和限制

## 贡献

欢迎提交问题和拉取请求。对于重大更改，请先开issue讨论您想要更改的内容。

### 致谢

感谢LinuxDo论坛的[F-droid](https://linux.do/u/F-droid/summary)曾经提供的[Docker部署教程以及镜像](https://linux.do/t/topic/234815)

感谢LinuxDo论坛的[HirasawaYui](https://linux.do/u/HirasawaYui/summary)曾经提供的GitHub Action

感谢[yuyins](https://github.com/houzixiashanxiedaima)提供的GitHub Action

感谢以下API服务的支持：

- [ipify](https://www.ipify.org/) - IP地址检测
- [ipapi](https://ipapi.co/) - IP地理位置信息
- [RandomUser](https://randomuser.me/) - 随机用户信息生成
- [OpenStreetMap](https://www.openstreetmap.org/) - 地理编码服务
- [Google Maps](https://www.google.com/maps) - 地图显示服务

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=a139u/ip&type=Date)](https://www.star-history.com/#a139u/ip&Date)

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
