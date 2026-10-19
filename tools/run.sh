#!/usr/bin/env bash
#
# 本地预览：跑 jekyll serve 并打开浏览器
#
# 用法：
#   bash tools/run.sh                 默认 127.0.0.1，开发模式
#   bash tools/run.sh -H 0.0.0.0      局域网可访问（手机上预览）
#   bash tools/run.sh -p              以 production 模式运行
#

prod=false
command="bundle exec jekyll s -l"
host="127.0.0.1"

help() {
  echo "Usage:"
  echo
  echo "   bash /path/to/run [options]"
  echo
  echo "Options:"
  echo "     -H, --host [HOST]    Host to bind to."
  echo "     -p, --production     Run Jekyll in 'production' mode."
  echo "     -h, --help           Print this help information."
}

while (($#)); do
  opt="$1"
  case $opt in
  -H | --host)
    host="$2"
    shift 2
    ;;
  -p | --production)
    prod=true
    shift
    ;;
  -h | --help)
    help
    exit 0
    ;;
  *)
    echo -e "> Unknown option: '$opt'\n"
    help
    exit 1
    ;;
  esac
done

command="$command -H $host"

if $prod; then
  command="JEKYLL_ENV=production $command"
fi

# 在 Docker / WSL 里跑的时候文件监听会失效，需要 force_polling
if [ -e /proc/1/cgroup ] && grep -q docker /proc/1/cgroup; then
  command="$command --force_polling"
fi

echo -e "\n> $command\n"
eval "$command"
