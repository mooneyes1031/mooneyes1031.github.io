#!/usr/bin/env ruby
#
# 自动推算文章的「最后修改时间」。
# 原理：看这篇文章在 git 历史里被提交过几次，超过 1 次就把最后一次提交的日期
# 写进 front matter 的 last_modified_at。
# 依赖 workflow 里的 fetch-depth: 0（需要完整 git 历史）。

Jekyll::Hooks.register :posts, :post_init do |post|

  commit_num = `git rev-list --count HEAD "#{ post.path }"`

  if commit_num.to_i > 1
    lastmod_date = `git log -1 --pretty="%ad" --date=iso "#{ post.path }"`
    post.data['last_modified_at'] = lastmod_date
  end

end
