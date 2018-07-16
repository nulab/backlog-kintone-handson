# backlog-kintone-handson

This is a sample code of collaboration between Backlog and kintone.

これは [kintone devCamp 2018](https://developer.cybozu.io/hc/ja/articles/360001062323-kintone-devCamp-2018) ハンズオン向けのサンプルコードです。

## Functions

- hello
    - サンプル1. JSON を受け取り、JSON を返すだけの単純なエンドポイント
- hello_hello_hello
    - サンプル2. 上記の hello を裏側で3回呼び出すエンドポイント
- add_issue_to_backlog
    - kintone の webhook を受け取り、Backlog への課題登録と、kintone への課題 URL 登録を行う
- update_issue_on_kintone
    - Backlog の webhook を受け取り、課題が完了したときに限り、kintone のレコード更新およびコメント追加を行う
