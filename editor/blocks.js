Blockly.Blocks['on_ready'] = {
  init: function () {
    this.appendDummyInput().appendField('🏁 Botが起動したとき');
    this.appendStatementInput('DO').setCheck(null).appendField('実行する処理');
    this.setColour(30);
    this.setTooltip('Botのログインが完了し、準備ができた時に1回だけ実行されます。');
  },
};
Blockly.Blocks['on_message_create'] = {
  init: function () {
    this.appendDummyInput().appendField('📩 メッセージを受信したとき');
    this.appendStatementInput('DO').setCheck(null).appendField('実行する処理');
    this.setColour(30);
    this.setTooltip('誰かがメッセージを送信した時に実行されます。');
  },
};
Blockly.Blocks['get_message_content'] = {
  init: function () {
    this.appendDummyInput().appendField('受信したメッセージの内容');
    this.setOutput(true, 'String');
    this.setColour(30);
  },
};
Blockly.Blocks['on_command_executed'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚡ スラッシュコマンド /')
      .appendField(new Blockly.FieldTextInput('hello'), 'COMMAND_NAME')
      .appendField('を使われたとき');
    this.appendStatementInput('DO').setCheck(null).appendField('実行する処理');
    this.setColour(230);
    this.setMutator(new Blockly.Mutator(['slash_command_arg_container']));
    this.arguments_ = [];
  },
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('slash_command_arg_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var itemBlock = workspace.newBlock('slash_command_arg');
      itemBlock.initSvg();
      itemBlock.setFieldValue(this.arguments_[i].name, 'ARG_NAME');
      itemBlock.setFieldValue(this.arguments_[i].type, 'ARG_TYPE');
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    this.arguments_ = [];
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      var argName = itemBlock.getFieldValue('ARG_NAME');
      var argType = itemBlock.getFieldValue('ARG_TYPE');
      this.arguments_.push({name: argName, type: argType});
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
  },
  saveConnections: function(containerBlock) {
    // NOP
  },
  updateShape_: function() {
    for (let i = 0; this.getInput('ARG' + i); i++) {
      this.removeInput('ARG' + i);
    }
    for (let i = 0; i < this.arguments_.length; i++) {
      this.appendDummyInput('ARG' + i)
          .appendField(this.arguments_[i].name + ' (' + this.arguments_[i].type + ')');
    }
    this.moveInputBefore('DO', null);
  }
};

Blockly.Blocks['slash_command_arg_container'] = {
  init: function() {
    this.appendDummyInput().appendField("引数");
    this.appendStatementInput('STACK');
    this.setColour(230);
    this.setTooltip("引数をここに追加します。");
    this.contextMenu = false;
  }
};

Blockly.Blocks['slash_command_arg'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("引数名")
        .appendField(new Blockly.FieldTextInput("name"), "ARG_NAME")
        .appendField("タイプ")
        .appendField(new Blockly.FieldDropdown([
          ["文字列", "str"],
          ["数値", "int"],
          ["真偽値", "bool"],
          ["ユーザー", "user"],
          ["チャンネル", "channel"],
          ["ロール", "role"]
        ]), "ARG_TYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("スラッシュコマンドに引数を追加します。");
    this.contextMenu = false;
  }
};
Blockly.Blocks['prefix_command'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🗣️ プレフィックスコマンド')
      .appendField(new Blockly.FieldTextInput('!ping'), 'COMMAND_NAME')
      .appendField('を実行したとき');
    this.appendStatementInput('DO').setCheck(null).appendField('実行する処理');
    this.setColour(230);
    this.setMutator(new Blockly.Mutator(['prefix_command_arg_container']));
    this.arguments_ = [];
  },
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('prefix_command_arg_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var itemBlock = workspace.newBlock('prefix_command_arg');
      itemBlock.initSvg();
      itemBlock.setFieldValue(this.arguments_[i], 'ARG_NAME');
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    this.arguments_ = [];
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    while (itemBlock) {
      this.arguments_.push(itemBlock.getFieldValue('ARG_NAME'));
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
  },
  saveConnections: function(containerBlock) {
    // NOP
  },
  updateShape_: function() {
    for (let i = 0; this.getInput('ARG' + i); i++) {
      this.removeInput('ARG' + i);
    }
    for (let i = 0; i < this.arguments_.length; i++) {
      this.appendDummyInput('ARG' + i)
          .appendField(this.arguments_[i]);
    }
    this.moveInputBefore('DO', null);
  }
};

Blockly.Blocks['prefix_command_arg_container'] = {
  init: function() {
    this.appendDummyInput().appendField("引数");
    this.appendStatementInput('STACK');
    this.setColour(230);
    this.setTooltip("引数をここに追加します。");
    this.contextMenu = false;
  }
};

Blockly.Blocks['prefix_command_arg'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("引数名")
        .appendField(new Blockly.FieldTextInput("name"), "ARG_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("プレフィックスコマンドに引数を追加します。");
    this.contextMenu = false;
  }
};
Blockly.Blocks['get_command_arg'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('コマンド引数')
      .appendField(new Blockly.FieldTextInput('name'), 'ARG_NAME')
      .appendField('の値');
    this.setOutput(true, ['String', 'Number']);
    this.setColour(230);
  },
};
Blockly.Blocks['get_user_info'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('👤 実行者の')
      .appendField(
        new Blockly.FieldDropdown([
          ['ユーザーID', 'id'],
          ['名前 (ユーザー名)', 'name'],
          ['表示名 (ニックネーム)', 'display_name'],
          ['メンション (<@ID>)', 'mention'],
        ]),
        'TYPE',
      );
    this.setOutput(true, 'String');
    this.setColour(260);
  },
};
Blockly.Blocks['get_member_detail'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('👤 実行者の詳細:')
      .appendField(
        new Blockly.FieldDropdown([
          ['アバターURL', 'avatar.url'],
          ['アカウント作成日', 'created_at'],
          ['サーバー参加日', 'joined_at'],
          ['ステータス', 'status'],
        ]),
        'TYPE',
      );
    this.setOutput(true, 'String');
    this.setColour(260);
  },
};
Blockly.Blocks['get_channel_info'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('📺 現在の')
      .appendField(
        new Blockly.FieldDropdown([
          ['チャンネルID', 'id'],
          ['チャンネル名', 'name'],
          ['メンション (<#ID>)', 'mention'],
        ]),
        'TYPE',
      );
    this.setOutput(true, 'String');
    this.setColour(260);
  },
};
Blockly.Blocks['get_server_info'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🌐 サーバーの')
      .appendField(
        new Blockly.FieldDropdown([
          ['サーバーID', 'id'],
          ['サーバー名', 'name'],
          ['メンバー数', 'member_count'],
        ]),
        'TYPE',
      );
    this.setOutput(true, ['String', 'Number']);
    this.setColour(260);
  },
};
Blockly.Blocks['member_has_role'] = {
  init: function () {
    this.appendValueInput('USER').setCheck('String').appendField('❓ ユーザー');
    this.appendValueInput('ROLE_ID').setCheck('String').appendField('がロール(ID)');
    this.appendDummyInput().appendField('を持っている');
    this.setOutput(true, 'Boolean');
    this.setColour(260);
  },
};
Blockly.Blocks['get_current_time'] = {
  init: function () {
    this.appendDummyInput().appendField('🕒 現在時刻 (文字列)');
    this.setOutput(true, 'String');
    this.setColour(260);
  },
};
Blockly.Blocks['reply_message'] = {
  init: function () {
    this.appendValueInput('MESSAGE').setCheck(['String', 'Embed']).appendField('↩️ 返信する');
    this.appendDummyInput()
      .appendField('自分だけに表示')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'EPHEMERAL');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['defer_reply'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⏳ 応答を保留する (考え中...)')
      .appendField('自分だけ')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'EPHEMERAL');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['edit_reply'] = {
  init: function () {
    this.appendValueInput('MESSAGE').setCheck(['String', 'Embed']).appendField('✏️ 返信を編集する');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['edit_message_by_id'] = {
  init: function () {
    this.appendValueInput('CHANNEL_ID').setCheck('String').appendField('✏️ 編集: チャンネルID');
    this.appendValueInput('MESSAGE_ID').setCheck('String').appendField('メッセージID');
    this.appendValueInput('CONTENT').setCheck('String').appendField('新しい内容');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['send_channel_message'] = {
  init: function () {
    this.appendValueInput('CHANNEL_ID').setCheck('String').appendField('#️⃣ チャンネルID');
    this.appendValueInput('MESSAGE').setCheck(['String', 'Embed']).appendField('に送信');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['delete_message'] = {
  init: function () {
    this.appendDummyInput().appendField('🗑️ このメッセージを削除');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['purge_messages'] = {
  init: function () {
    this.appendValueInput('LIMIT').setCheck('Number').appendField('🗑️ メッセージを一括削除（');
    this.appendDummyInput().appendField('件）');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['pin_message'] = {
  init: function () {
    this.appendDummyInput().appendField('📌 このメッセージをピン留め');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['add_reaction'] = {
  init: function () {
    this.appendValueInput('EMOJI').setCheck('String').appendField('👍 リアクションを付ける');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['create_thread'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck('String').appendField('🧵 スレッドを作成（名前');
    this.appendDummyInput().appendField('）');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['wait_for_message'] = {
  init: function () {
    this.appendValueInput('TIMEOUT').setCheck('Number').appendField('⏳ 返信を待つ (最大');
    this.appendDummyInput().appendField('秒)');
    this.setOutput(true, 'String');
    this.setColour(290);
  },
};
Blockly.Blocks['print_to_console'] = {
  init: function () {
    this.appendValueInput('TEXT').setCheck(null).appendField('🖨️ コンソールに表示');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
  },
};
Blockly.Blocks['json_load'] = {
  init: function () {
    this.appendValueInput('FILENAME').setCheck('String').appendField('📂 JSONファイルを読み込む (');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, null);
    this.setColour(30);
  },
};
Blockly.Blocks['json_save'] = {
  init: function () {
    this.appendValueInput('DATA').setCheck(null).appendField('💾 データを保存: ');
    this.appendValueInput('FILENAME').setCheck('String').appendField(' ファイル名(');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  },
};
Blockly.Blocks['dict_create'] = {
  init: function () {
    this.appendDummyInput().appendField('📦 空の辞書(データ)を作成');
    this.setOutput(true, null);
    this.setColour(30);
  },
};
Blockly.Blocks['dict_get'] = {
  init: function () {
    this.appendValueInput('DICT').setCheck(null).appendField('辞書');
    this.appendValueInput('KEY').setCheck('String').appendField('からキー');
    this.appendDummyInput().appendField('の値を取得');
    this.setOutput(true, null);
    this.setColour(30);
  },
};
Blockly.Blocks['dict_set'] = {
  init: function () {
    this.appendValueInput('DICT').setCheck(null).appendField('辞書');
    this.appendValueInput('KEY').setCheck('String').appendField('のキー');
    this.appendValueInput('VALUE').setCheck(null).appendField('に値');
    this.appendDummyInput().appendField('を設定');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(30);
  },
};
Blockly.Blocks['join_voice_channel'] = {
  init: function () {
    this.appendDummyInput().appendField('🔊 実行者のボイスチャンネルに参加');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
  },
};
Blockly.Blocks['leave_voice_channel'] = {
  init: function () {
    this.appendDummyInput().appendField('🔇 ボイスチャンネルから切断');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
  },
};
Blockly.Blocks['create_text_channel'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck('String').appendField('📁 テキストチャンネル作成');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
  },
};
Blockly.Blocks['delete_channel'] = {
  init: function () {
    this.appendValueInput('CHANNEL_ID').setCheck('String').appendField('🗑️ チャンネル削除 (ID');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(340);
  },
};
Blockly.Blocks['set_bot_status'] = {
  init: function () {
    this.appendValueInput('STATUS').setCheck('String').appendField('🎮 ステータスを');
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['プレイ中', 'playing'],
          ['視聴中', 'watching'],
          ['再生中', 'listening'],
        ]),
        'TYPE',
      )
      .appendField('にする');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
  },
};
Blockly.Blocks['wait_seconds'] = {
  init: function () {
    this.appendValueInput('SECONDS').setCheck('Number').appendField('⏳');
    this.appendDummyInput().appendField('秒待つ');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
  },
};
Blockly.Blocks['create_embed'] = {
  init: function () {
    this.appendDummyInput().appendField('✨ 新しい埋め込み(Embed)作成');
    this.appendStatementInput('PROPERTIES').setCheck(null);
    this.setOutput(true, 'Embed');
    this.setColour(100);
  },
};
Blockly.Blocks['set_embed_property'] = {
  init: function () {
    this.appendValueInput('VALUE')
      .setCheck('String')
      .appendField('設定：')
      .appendField(
        new Blockly.FieldDropdown([
          ['タイトル', 'title'],
          ['説明文', 'description'],
          ['色 (0xHex)', 'color'],
          ['画像URL', 'image'],
        ]),
        'PROPERTY',
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(100);
  },
};
Blockly.Blocks['add_embed_field'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck('String').appendField('項目名');
    this.appendValueInput('VALUE').setCheck('String').appendField('内容');
    this.appendDummyInput()
      .appendField('横並び')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'INLINE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(100);
  },
};
Blockly.Blocks['kick_user'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('👢 Kickする (ID');
    this.appendValueInput('REASON').setCheck('String').appendField('理由');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['ban_user'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('🚫 BANする (ID');
    this.appendValueInput('REASON').setCheck('String').appendField('理由');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['timeout_user'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('🔇 タイムアウト (ID');
    this.appendValueInput('MINUTES').setCheck('Number').appendField('分');
    this.appendDummyInput().appendField('間)');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['add_user_role'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('➕ ロール付与 (ユーザーID');
    this.appendValueInput('ROLE_ID').setCheck('String').appendField('ロールID');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['remove_user_role'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('➖ ロール剥奪 (ユーザーID');
    this.appendValueInput('ROLE_ID').setCheck('String').appendField('ロールID');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['create_role'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck('String').appendField('🔰 新規ロール作成 (名前');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['change_nickname'] = {
  init: function () {
    this.appendValueInput('USER_ID').setCheck('String').appendField('🏷️ ニックネーム変更 (ID');
    this.appendValueInput('NAME').setCheck('String').appendField('新しい名前');
    this.appendDummyInput().appendField(')');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
  },
};
Blockly.Blocks['lists_append_to'] = {
  init: function () {
    this.appendValueInput('LIST').setCheck('Array').appendField('リスト');
    this.appendValueInput('ITEM').setCheck(null).appendField('に項目');
    this.appendDummyInput().appendField('を追加');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
  },
};
Blockly.Blocks['random_choice'] = {
  init: function () {
    this.appendValueInput('LIST').setCheck('Array').appendField('🎲 リスト');
    this.appendDummyInput().appendField('からランダムに1つ選ぶ');
    this.setOutput(true, null);
    this.setColour(230);
  },
};
Blockly.Blocks['random_integer'] = {
  init: function () {
    this.appendValueInput('FROM').setCheck('Number').appendField('🎲 乱数 (最小');
    this.appendValueInput('TO').setCheck('Number').appendField('〜 最大');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
  },
};
Blockly.Blocks['text_replace'] = {
  init: function () {
    this.appendValueInput('TEXT').setCheck('String').appendField('テキスト');
    this.appendValueInput('FROM').setCheck('String').appendField('の中の');
    this.appendValueInput('TO').setCheck('String').appendField('を');
    this.appendDummyInput().appendField('に置換する');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
  },
};
const getBranchCode = (block, name) => {
  let code = Blockly.Python.statementToCode(block, name);
  if (!code || code.trim() === '') return Blockly.Python.INDENT + 'pass\n';
  return code;
};
Blockly.JavaScript['on_ready'] = function (block) {
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `\nclient.on('ready', async () => {\n  console.log(\`Logged in as \${client.user.tag}!\`);\n${branch.trimEnd()}\n});\n`;
};
Blockly.Python['custom_python_code'] = function (block) {
  const code = block.getFieldValue('CODE');
  return code + '\n';
};
Blockly.Python['on_ready'] = function (block) {
  const branch = getBranchCode(block, 'DO');
  return `\n@bot.event\nasync def on_ready():\n    print(f'Logged in as {bot.user}')\n    try:\n        synced = await bot.tree.sync()\n        print(f"Synced {len(synced)} command(s)")\n    except Exception as e:\n        print(e)\n${branch.trimEnd()}\n`;
};
Blockly.Python['on_message_create'] = function (block) {
  const branch = getBranchCode(block, 'DO');
  return `\n@bot.event\nasync def on_message(message):\n    if message.author == bot.user:\n        return\n    ctx = message\n    user = message.author\n${branch.trimEnd()}\n    await bot.process_commands(message)\n`;
};
Blockly.JavaScript['on_message_create'] = function (block) {
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `\nclient.on('messageCreate', async (message) => {\n  if (message.author.bot) return;\n  const ctx = message;\n  const user = message.author;\n${branch.trimEnd()}\n});\n`;
};

Blockly.Python['get_message_content'] = function (block) {
  return [
    '(ctx.content if "ctx" in locals() and hasattr(ctx, "content") else "")',
    Blockly.Python.ORDER_ATOMIC,
  ];
};
Blockly.JavaScript['get_message_content'] = function (block) {
  return ['(ctx.content || "")', Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Python['on_command_executed'] = function (block) {
  const commandName = block.getFieldValue('COMMAND_NAME').toLowerCase();
  const branch = getBranchCode(block, 'DO');
  
  let args = [];
  let describes = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    const arg = block.arguments_[i];
    const argName = arg.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const argType = arg.type;
    let pyType = 'str';
    switch(argType) {
      case 'int': pyType = 'int'; break;
      case 'bool': pyType = 'bool'; break;
      case 'user': pyType = 'discord.User'; break;
      case 'channel': pyType = 'discord.TextChannel'; break;
      case 'role': pyType = 'discord.Role'; break;
    }
    args.push(`${argName}: ${pyType}`);
    describes.push(`@app_commands.describe(${argName}='${arg.name}')`);
  }
  
  const describeLines = describes.join('\\n');
  const argsLine = args.length > 0 ? ', ' + args.join(', ') : '';

  return `\n@bot.tree.command(name="${commandName}", description="${commandName} command")\n${describeLines}\nasync def ${commandName}_cmd(interaction: discord.Interaction${argsLine}):\n    ctx = interaction\n    user = interaction.user\n${branch.trimEnd()}\n`;
};
Blockly.JavaScript['on_command_executed'] = function (block) {
  const commandName = block.getFieldValue('COMMAND_NAME').toLowerCase();
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `\nclient.on('interactionCreate', async (interaction) => {\n  if (!interaction.isCommand() || interaction.commandName !== '${commandName}') return;\n  const ctx = interaction;\n  const user = interaction.user;\n${branch.trimEnd()}\n});\n`;
};

Blockly.Python['prefix_command'] = function (block) {
  const commandName = block.getFieldValue('COMMAND_NAME').replace(/^[!~#&?]/, '');
  const branch = getBranchCode(block, 'DO');

  let args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    const argName = block.arguments_[i].toLowerCase().replace(/[^a-z0-9_]/g, '');
    args.push(argName);
  }
  const argsLine = args.length > 0 ? ', ' + args.join(', ') : '';
  
  return `\n@bot.command(name='${commandName}')\nasync def ${commandName}_cmd(ctx${argsLine}):\n    user = ctx.author\n${branch.trimEnd()}\n`;
};
Blockly.JavaScript['prefix_command'] = function (block) {
  const commandName = block.getFieldValue('COMMAND_NAME');
  const branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return `\nclient.on('messageCreate', async (message) => {\n  if (!message.content.startsWith('${commandName}')) return;\n  const ctx = message;\n  const user = message.author;\n${branch.trimEnd()}\n});\n`;
};
Blockly.Python['get_command_arg'] = function (block) {
  const argName = block.getFieldValue('ARG_NAME');
  return [argName, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['get_command_arg'] = function (block) {
  const argName = block.getFieldValue('ARG_NAME');
  const code = `(ctx.content.split(' ')[1] || "")`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Python['get_user_info'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let code = `user.${type}`;
  if (type === 'name') code = 'user.name';
  if (type === 'display_name') code = 'user.display_name';
  return [`(${code} if "user" in locals() else "Unknown")`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['get_user_info'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let code = `user.${type}`;
  if (type === 'name') code = 'user.username';
  if (type === 'display_name') code = 'user.displayName';
  return [`(${code} || "Unknown")`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['get_member_detail'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let code = `user.${type}`;
  if (type === 'avatar.url') code = 'str(user.avatar.url) if user.avatar else ""';
  if (type === 'created_at') code = 'str(user.created_at.strftime("%Y-%m-%d %H:%M"))';
  if (type === 'joined_at')
    code = 'str(user.joined_at.strftime("%Y-%m-%d %H:%M")) if hasattr(user, "joined_at") else ""';
  if (type === 'status') code = 'str(user.status) if hasattr(user, "status") else "unknown"';
  return [`(${code} if "user" in locals() else "Unknown")`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['get_member_detail'] = function (block) {
    const type = block.getFieldValue('TYPE');
    let code = `user.${type}`;
    if (type === 'avatar.url') code = 'user.displayAvatarURL()';
    if (type === 'created_at') code = 'user.createdAt.toISOString()';
    if (type === 'joined_at') code = '(ctx.member ? ctx.member.joinedAt.toISOString() : "")';
    if (type === 'status') code = '(ctx.guild.presences.cache.get(user.id)?.status || "offline")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['get_channel_info'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let code = `ctx.channel.${type}`;
  return [
    `(${code} if "ctx" in locals() and hasattr(ctx, "channel") else "Unknown")`,
    Blockly.Python.ORDER_ATOMIC,
  ];
};
Blockly.JavaScript['get_channel_info'] = function (block) {
    const type = block.getFieldValue('TYPE');
    let code = `ctx.channel.${type}`;
    return [`(ctx.channel ? ${code} : "Unknown")`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['get_server_info'] = function (block) {
  const type = block.getFieldValue('TYPE');
  let code = `ctx.guild.${type}`;
  return [
    `(${code} if "ctx" in locals() and ctx.guild else "Unknown")`,
    Blockly.Python.ORDER_ATOMIC,
  ];
};
Blockly.JavaScript['get_server_info'] = function (block) {
    const type = block.getFieldValue('TYPE');
    let code = `ctx.guild.${type}`;
    return [`(ctx.guild ? ${code} : "Unknown")`, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Python['member_has_role'] = function (block) {
  const userCode = Blockly.Python.valueToCode(block, 'USER', Blockly.Python.ORDER_NONE) || '0';
  const roleId = Blockly.Python.valueToCode(block, 'ROLE_ID', Blockly.Python.ORDER_NONE) || '0';
  const code = `(discord.utils.get(ctx.guild.get_member(int(${userCode})).roles, id=int(${roleId})) is not None if "ctx" in locals() and ctx.guild and str(${userCode}).isdigit() and str(${roleId}).isdigit() else False)`;
  return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['member_has_role'] = function (block) {
    const userCode = Blockly.JavaScript.valueToCode(block, 'USER', Blockly.JavaScript.ORDER_NONE) || '0';
    const roleId = Blockly.JavaScript.valueToCode(block, 'ROLE_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const code = `(ctx.guild.members.cache.get(${userCode})?.roles.cache.has(${roleId}) || false)`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['get_current_time'] = function (block) {
  return [`datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['get_current_time'] = function (block) {
    return [`new Date().toISOString()`, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Python['reply_message'] = function (block) {
  const msg = Blockly.Python.valueToCode(block, 'MESSAGE', Blockly.Python.ORDER_NONE) || '""';
  const ephemeral = block.getFieldValue('EPHEMERAL') === 'TRUE' ? 'True' : 'False';
  let contentCode = msg.startsWith('discord.Embed') ? `embed=${msg}` : `content=${msg}`;
  return `\nif 'ctx' in locals():\n    if isinstance(ctx, discord.Interaction):\n        if ctx.response.is_done():\n            await ctx.followup.send(${contentCode}, ephemeral=${ephemeral})\n        else:\n            await ctx.response.send_message(${contentCode}, ephemeral=${ephemeral})\n    elif isinstance(ctx, commands.Context):\n        await ctx.send(${contentCode})\n    elif isinstance(ctx, discord.Message):\n        await ctx.reply(${contentCode})\n`;
};
Blockly.JavaScript['reply_message'] = function (block) {
    const msg = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_NONE) || '""';
    const ephemeral = block.getFieldValue('EPHEMERAL') === 'TRUE';
    let contentCode = `content: ${msg}`;
    if (msg.startsWith('new EmbedBuilder()')) {
        contentCode = `embeds: [${msg}]`;
    }
    return `\nif (ctx.isCommand && ctx.isCommand()) {\n  if (ctx.deferred || ctx.replied) {\n    await ctx.followUp({ ${contentCode}, ephemeral: ${ephemeral} });\n  } else {\n    await ctx.reply({ ${contentCode}, ephemeral: ${ephemeral} });\n  }\n} else if (ctx.channel) {\n  await ctx.channel.send({ ${contentCode} });\n}\n`;
};

Blockly.Python['defer_reply'] = function (block) {
  const ephemeral = block.getFieldValue('EPHEMERAL') === 'TRUE' ? 'True' : 'False';
  return `\nif 'ctx' in locals():\n    if isinstance(ctx, discord.Interaction):\n        await ctx.response.defer(ephemeral=${ephemeral})\n    elif isinstance(ctx, commands.Context):\n        async with ctx.typing(): pass\n`;
};
Blockly.JavaScript['defer_reply'] = function (block) {
    const ephemeral = block.getFieldValue('EPHEMERAL') === 'TRUE';
    return `\nif (ctx.isCommand && ctx.isCommand()) {\n  await ctx.deferReply({ ephemeral: ${ephemeral} });\n} else if (ctx.channel) {\n  await ctx.channel.sendTyping();\n}\n`;
};

Blockly.Python['edit_reply'] = function (block) {
  const msg = Blockly.Python.valueToCode(block, 'MESSAGE', Blockly.Python.ORDER_NONE) || '""';
  let contentCode = msg.startsWith('discord.Embed') ? `embed=${msg}` : `content=${msg}`;
  return `\nif 'ctx' in locals() and isinstance(ctx, discord.Interaction):\n    await ctx.edit_original_response(${contentCode})\n`;
};
Blockly.JavaScript['edit_reply'] = function (block) {
    const msg = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_NONE) || '""';
    let contentCode = `content: ${msg}`;
    if (msg.startsWith('new EmbedBuilder()')) {
        contentCode = `embeds: [${msg}]`;
    }
    return `\nif (ctx.isCommand && ctx.isCommand()) {\n  await ctx.editReply({ ${contentCode} });\n}\n`;
};
Blockly.Python['edit_message_by_id'] = function (block) {
  const channelId =
    Blockly.Python.valueToCode(block, 'CHANNEL_ID', Blockly.Python.ORDER_NONE) || '0';
  const messageId =
    Blockly.Python.valueToCode(block, 'MESSAGE_ID', Blockly.Python.ORDER_NONE) || '0';
  const content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_NONE) || '""';
  return `\ntry:\n    _ch = bot.get_channel(int(${channelId}))\n    if _ch:\n        _msg = await _ch.fetch_message(int(${messageId}))\n        if _msg: await _msg.edit(content=${content})\nexcept Exception as e:\n    print(f"Edit Error: {e}")\n`;
};
Blockly.JavaScript['edit_message_by_id'] = function (block) {
    const channelId = Blockly.JavaScript.valueToCode(block, 'CHANNEL_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const messageId = Blockly.JavaScript.valueToCode(block, 'MESSAGE_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const content = Blockly.JavaScript.valueToCode(block, 'CONTENT', Blockly.JavaScript.ORDER_NONE) || '""';
    return `\nclient.channels.cache.get(${channelId})?.messages.fetch(${messageId}).then(message => message.edit(${content})).catch(console.error);\n`;
};

Blockly.Python['send_channel_message'] = function (block) {
  const channelId =
    Blockly.Python.valueToCode(block, 'CHANNEL_ID', Blockly.Python.ORDER_NONE) || '0';
  const msg = Blockly.Python.valueToCode(block, 'MESSAGE', Blockly.Python.ORDER_NONE) || '""';
  const contentArg = msg.startsWith('discord.Embed') ? `embed=${msg}` : `content=${msg}`;
  return `\n_ch_id = int(${channelId}) if str(${channelId}).isdigit() else 0\n_channel = bot.get_channel(_ch_id)\nif _channel:\n    await _channel.send(${contentArg})\n`;
};
Blockly.JavaScript['send_channel_message'] = function (block) {
    const channelId = Blockly.JavaScript.valueToCode(block, 'CHANNEL_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const msg = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_NONE) || '""';
    let contentArg = `content: ${msg}`;
    if (msg.startsWith('new EmbedBuilder()')) {
        contentArg = `embeds: [${msg}]`;
    }
    return `\nclient.channels.cache.get(${channelId})?.send({ ${contentArg} }).catch(console.error);\n`;
};

Blockly.Python['delete_message'] = function (block) {
  return `\nif 'ctx' in locals():\n    if isinstance(ctx, discord.Message):\n        await ctx.delete()\n    elif isinstance(ctx, commands.Context):\n        await ctx.message.delete()\n`;
};
Blockly.JavaScript['delete_message'] = function (block) {
    return `\nif (ctx.deletable) {\n  await ctx.delete().catch(console.error);\n}\n`;
};

Blockly.Python['purge_messages'] = function (block) {
  const limit = Blockly.Python.valueToCode(block, 'LIMIT', Blockly.Python.ORDER_NONE) || '5';
  return `\nif 'ctx' in locals() and hasattr(ctx, 'channel') and hasattr(ctx.channel, 'purge'):\n    await ctx.channel.purge(limit=int(${limit}))\n`;
};
Blockly.JavaScript['purge_messages'] = function (block) {
    const limit = Blockly.JavaScript.valueToCode(block, 'LIMIT', Blockly.JavaScript.ORDER_NONE) || '5';
    return `\nif (ctx.channel && ctx.channel.bulkDelete) {\n  await ctx.channel.bulkDelete(${limit}).catch(console.error);\n}\n`;
};

Blockly.Python['pin_message'] = function (block) {
  return `\nif 'ctx' in locals():\n    if isinstance(ctx, discord.Message):\n        await ctx.pin()\n    elif isinstance(ctx, commands.Context):\n        await ctx.message.pin()\n`;
};
Blockly.JavaScript['pin_message'] = function (block) {
    return `\nif (ctx.pinnable) {\n  await ctx.pin().catch(console.error);\n}\n`;
};

Blockly.Python['add_reaction'] = function (block) {
  const emoji = Blockly.Python.valueToCode(block, 'EMOJI', Blockly.Python.ORDER_NONE) || '"👍"';
  return `\ntry:\n    if 'ctx' in locals():\n        if isinstance(ctx, discord.Message): \n            await ctx.add_reaction(${emoji})\n        elif isinstance(ctx, commands.Context): \n            await ctx.message.add_reaction(${emoji})\nexcept Exception:\n    pass\n`;
};
Blockly.JavaScript['add_reaction'] = function (block) {
    const emoji = Blockly.JavaScript.valueToCode(block, 'EMOJI', Blockly.JavaScript.ORDER_NONE) || '"👍"';
    return `\nawait ctx.react(${emoji}).catch(console.error);\n`;
};

Blockly.Python['create_thread'] = function (block) {
  const name =
    Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE) || '"New Thread"';
  return `\ntry:\n    if 'ctx' in locals():\n        if isinstance(ctx, discord.Message): \n            await ctx.create_thread(name=${name})\n        elif isinstance(ctx, commands.Context): \n            await ctx.message.create_thread(name=${name})\nexcept Exception:\n    pass\n`;
};
Blockly.JavaScript['create_thread'] = function (block) {
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '"New Thread"';
    return `\nif (ctx.channel.threads) {\n  await ctx.channel.threads.create({ name: ${name} }).catch(console.error);\n}\n`;
};
Blockly.Python['wait_for_message'] = function (block) {
  const timeout = Blockly.Python.valueToCode(block, 'TIMEOUT', Blockly.Python.ORDER_NONE) || '30';
  const code =
    `\n(await bot.wait_for('message', check=lambda m: m.channel == ctx.channel and m.author == user, timeout=${timeout})).content\n`.trim();
  return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['wait_for_message'] = function (block) {
    const timeout = Blockly.JavaScript.valueToCode(block, 'TIMEOUT', Blockly.JavaScript.ORDER_NONE) || '30';
    const code = `\n(await ctx.channel.awaitMessages({ filter: m => m.author.id === user.id, max: 1, time: ${timeout} * 1000, errors: ['time'] })).first().content\n`;
    return [code.trim(), Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['print_to_console'] = function (block) {
  const text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_NONE) || '""';
  return `print(${text})\n`;
};
Blockly.JavaScript['print_to_console'] = function (block) {
    const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_NONE) || '""';
    return `console.log(${text});\n`;
};
Blockly.Python['join_voice_channel'] = function (block) {
  return `\nif 'user' in locals() and user.voice:\n    await user.voice.channel.connect()\n`;
};
Blockly.JavaScript['join_voice_channel'] = function (block) {
    return `\nif (ctx.member && ctx.member.voice.channel) {\n  const { joinVoiceChannel } = require('@discordjs/voice');\n  joinVoiceChannel({ channelId: ctx.member.voice.channel.id, guildId: ctx.guild.id, adapterCreator: ctx.guild.voiceAdapterCreator });\n}\n`;
};

Blockly.Python['leave_voice_channel'] = function (block) {
  return `\nif 'ctx' in locals() and ctx.guild.voice_client:\n    await ctx.guild.voice_client.disconnect()\n`;
};
Blockly.JavaScript['leave_voice_channel'] = function (block) {
    return `\nconst { getVoiceConnection } = require('@discordjs/voice');\nconst connection = getVoiceConnection(ctx.guild.id);\nif (connection) {\n  connection.destroy();\n}\n`;
};

Blockly.Python['create_text_channel'] = function (block) {
  const name =
    Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE) || '"new-channel"';
  return `\nif 'ctx' in locals() and ctx.guild:\n    await ctx.guild.create_text_channel(name=${name})\n`;
};
Blockly.JavaScript['create_text_channel'] = function (block) {
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '"new-channel"';
    return `\nif (ctx.guild) {\n  ctx.guild.channels.create({ name: ${name}, type: 0 }).catch(console.error);\n}\n`;
};

Blockly.Python['delete_channel'] = function (block) {
  const channelId =
    Blockly.Python.valueToCode(block, 'CHANNEL_ID', Blockly.Python.ORDER_NONE) || '0';
  return `\n_ch = bot.get_channel(int(${channelId}))\nif _ch:\n    await _ch.delete()\n`;
};
Blockly.JavaScript['delete_channel'] = function (block) {
    const channelId = Blockly.JavaScript.valueToCode(block, 'CHANNEL_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    return `\nclient.channels.cache.get(${channelId})?.delete().catch(console.error);\n`;
};
Blockly.Python['set_bot_status'] = function (block) {
  const status = Blockly.Python.valueToCode(block, 'STATUS', Blockly.Python.ORDER_NONE) || '"Bot"';
  const type = block.getFieldValue('TYPE');
  let activityCode = `discord.Game(name=${status})`;
  if (type === 'watching')
    activityCode = `discord.Activity(type=discord.ActivityType.watching, name=${status})`;
  if (type === 'listening')
    activityCode = `discord.Activity(type=discord.ActivityType.listening, name=${status})`;
  return `await bot.change_presence(activity=${activityCode})\n`;
};
Blockly.JavaScript['set_bot_status'] = function (block) {
    const status = Blockly.JavaScript.valueToCode(block, 'STATUS', Blockly.JavaScript.ORDER_NONE) || '"Bot"';
    const type = block.getFieldValue('TYPE');
    let activityType = 'PLAYING';
    if (type === 'watching') activityType = 'WATCHING';
    if (type === 'listening') activityType = 'LISTENING';
    return `\nclient.user.setActivity(${status}, { type: '${activityType}' });\n`;
};

Blockly.Python['wait_seconds'] = function (block) {
  const sec = Blockly.Python.valueToCode(block, 'SECONDS', Blockly.Python.ORDER_NONE) || '1';
  return `await asyncio.sleep(${sec})\n`;
};
Blockly.JavaScript['wait_seconds'] = function (block) {
    const sec = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_NONE) || '1';
    return `\nawait new Promise(resolve => setTimeout(resolve, ${sec} * 1000));\n`;
};
Blockly.Python['create_embed'] = function (block) {
  const embedVarName = Blockly.Python.variableDB_.getDistinctName(
    'embed',
    Blockly.Names.VARIABLE_NAME,
  );
  let code =
    `\n${embedVarName} = discord.Embed(title="No Title", description="...", color=0x3498DB)\n`.trim() +
    '\n';
  const propertiesCode = Blockly.Python.statementToCode(block, 'PROPERTIES');
  const lines = propertiesCode.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.includes('# EMBED_VAR_PLACEHOLDER')) {
      code += line.replace(/# EMBED_VAR_PLACEHOLDER/g, embedVarName) + '\n';
    } else if (line.trim().startsWith('embed.')) {
      code += line.replace(/embed\./g, `${embedVarName}.`) + '\n';
    }
  }
  return [`${embedVarName}`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['create_embed'] = function (block) {
    const embedVarName = Blockly.JavaScript.variableDB_.getDistinctName(
        'embed',
        Blockly.Names.VARIABLE_NAME,
    );
    let code = `\nconst ${embedVarName} = new EmbedBuilder().setTitle("No Title").setDescription("...").setColor(0x3498DB);\n`;
    const propertiesCode = Blockly.JavaScript.statementToCode(block, 'PROPERTIES');
    code += propertiesCode;
    return [embedVarName, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['set_embed_property'] = function (block) {
  const property = block.getFieldValue('PROPERTY');
  const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '""';
  if (property === 'color') return `embed.color = ${value}\n`;
  if (property === 'image') return `embed.set_image(url=${value})\n`;
  if (property === 'title') return `embed.title = ${value}\n`;
  if (property === 'description') return `embed.description = ${value}\n`;
  return '';
};
Blockly.JavaScript['set_embed_property'] = function (block) {
    const property = block.getFieldValue('PROPERTY');
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '""';
    if (property === 'color') return `embed.setColor(${value});\n`;
    if (property === 'image') return `embed.setImage(${value});\n`;
    if (property === 'title') return `embed.setTitle(${value});\n`;
    if (property === 'description') return `embed.setDescription(${value});\n`;
    return '';
};

Blockly.Python['add_embed_field'] = function (block) {
  const name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE) || '"Name"';
  const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '"Value"';
  const inline = block.getFieldValue('INLINE') === 'TRUE' ? 'True' : 'False';
  return `# EMBED_VAR_PLACEHOLDER.add_field(name=${name}, value=${value}, inline=${inline})\n`;
};
Blockly.JavaScript['add_embed_field'] = function (block) {
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '"Name"';
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '"Value"';
    const inline = block.getFieldValue('INLINE') === 'TRUE';
    return `embed.addFields({ name: ${name}, value: ${value}, inline: ${inline} });\n`;
};
Blockly.Python['kick_user'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const reason = Blockly.Python.valueToCode(block, 'REASON', Blockly.Python.ORDER_NONE) || 'None';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    if _m: await _m.kick(reason=${reason})\n`;
};
Blockly.JavaScript['kick_user'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const reason = Blockly.JavaScript.valueToCode(block, 'REASON', Blockly.JavaScript.ORDER_NONE) || '""';
    return `\nctx.guild?.members.kick(${user}, ${reason}).catch(console.error);\n`;
};

Blockly.Python['ban_user'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const reason = Blockly.Python.valueToCode(block, 'REASON', Blockly.Python.ORDER_NONE) || 'None';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    if _m: await _m.ban(reason=${reason})\n`;
};
Blockly.JavaScript['ban_user'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const reason = Blockly.JavaScript.valueToCode(block, 'REASON', Blockly.JavaScript.ORDER_NONE) || '""';
    return `\nctx.guild?.members.ban(${user}, { reason: ${reason} }).catch(console.error);\n`;
};

Blockly.Python['timeout_user'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const mins = Blockly.Python.valueToCode(block, 'MINUTES', Blockly.Python.ORDER_NONE) || '5';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    if _m:\n        await _m.timeout(datetime.timedelta(minutes=int(${mins})))\n`;
};
Blockly.JavaScript['timeout_user'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const mins = Blockly.JavaScript.valueToCode(block, 'MINUTES', Blockly.JavaScript.ORDER_NONE) || '5';
    return `\nctx.guild?.members.fetch(${user}).then(member => member.timeout(${mins} * 60 * 1000)).catch(console.error);\n`;
};

Blockly.Python['add_user_role'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const role = Blockly.Python.valueToCode(block, 'ROLE_ID', Blockly.Python.ORDER_NONE) || '0';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    _r = ctx.guild.get_role(int(${role}))\n    if _m and _r: await _m.add_roles(_r)\n`;
};
Blockly.JavaScript['add_user_role'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const role = Blockly.JavaScript.valueToCode(block, 'ROLE_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    return `\nctx.guild?.members.fetch(${user}).then(member => member.roles.add(${role})).catch(console.error);\n`;
};

Blockly.Python['remove_user_role'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const role = Blockly.Python.valueToCode(block, 'ROLE_ID', Blockly.Python.ORDER_NONE) || '0';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    _r = ctx.guild.get_role(int(${role}))\n    if _m and _r: await _m.remove_roles(_r)\n`;
};
Blockly.JavaScript['remove_user_role'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const role = Blockly.JavaScript.valueToCode(block, 'ROLE_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    return `\nctx.guild?.members.fetch(${user}).then(member => member.roles.remove(${role})).catch(console.error);\n`;
};

Blockly.Python['create_role'] = function (block) {
  const name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE) || '"New Role"';
  return `\nif 'ctx' in locals() and ctx.guild:\n    await ctx.guild.create_role(name=${name})\n`;
};
Blockly.JavaScript['create_role'] = function (block) {
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '"New Role"';
    return `\nctx.guild?.roles.create({ name: ${name} }).catch(console.error);\n`;
};

Blockly.Python['change_nickname'] = function (block) {
  const user = Blockly.Python.valueToCode(block, 'USER_ID', Blockly.Python.ORDER_NONE) || '0';
  const name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_NONE) || '"New Nick"';
  return `\nif 'ctx' in locals() and ctx.guild:\n    _m = ctx.guild.get_member(int(${user}))\n    if _m: await _m.edit(nick=${name})\n`;
};
Blockly.JavaScript['change_nickname'] = function (block) {
    const user = Blockly.JavaScript.valueToCode(block, 'USER_ID', Blockly.JavaScript.ORDER_NONE) || '0';
    const name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_NONE) || '"New Nick"';
    return `\nctx.guild?.members.fetch(${user}).then(member => member.setNickname(${name})).catch(console.error);\n`;
};
Blockly.Python['procedures_defnoreturn'] = Blockly.Python['procedures_defreturn'] = function (
  block,
) {
  const funcName = Blockly.Python.variableDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.Names.PROCEDURE_NAME,
  );
  const branch = getBranchCode(block, 'STACK');
  let args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args.push(Blockly.Python.variableDB_.getName(block.arguments_[i], Blockly.Names.VARIABLE_NAME));
  }
  const argsString = args.join(', ');
  let returnValue = Blockly.Python.valueToCode(block, 'RETURN', Blockly.Python.ORDER_NONE) || '';
  let returnCode = '';
  if (block.type === 'procedures_defreturn' && returnValue) {
    returnCode = `${Blockly.Python.INDENT}return ${returnValue}\n`;
  }
  return `\nasync def ${funcName}(${argsString}):\n${branch.trimEnd()}\n${returnCode.trimEnd()}\n`;
};
Blockly.JavaScript['procedures_defnoreturn'] = Blockly.JavaScript['procedures_defreturn'] = function(block) {
    const funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Names.PROCEDURE_NAME,);
    const branch = Blockly.JavaScript.statementToCode(block, 'STACK');
    let args = [];
    for (let i = 0; i < block.arguments_.length; i++) {
        args.push(Blockly.JavaScript.variableDB_.getName(block.arguments_[i], Blockly.Names.VARIABLE_NAME));
    }
    const argsString = args.join(', ');
    let returnValue = Blockly.JavaScript.valueToCode(block, 'RETURN', Blockly.JavaScript.ORDER_NONE) || '';
    let returnCode = '';
    if (block.type === 'procedures_defreturn' && returnValue) {
        returnCode = `  return ${returnValue};\n`;
    }
    return `\nasync function ${funcName}(${argsString}) {\n${branch}${returnCode}}\n`;
};

Blockly.Python['procedures_callnoreturn'] = function (block) {
  const funcName = Blockly.Python.variableDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.Names.PROCEDURE_NAME,
  );
  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args.push(Blockly.Python.valueToCode(block, 'ARG' + i, Blockly.Python.ORDER_NONE) || 'None');
  }
  return `await ${funcName}(${args.join(', ')})\n`;
};
Blockly.JavaScript['procedures_callnoreturn'] = function (block) {
    const funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Names.PROCEDURE_NAME,);
    const args = [];
    for (let i = 0; i < block.arguments_.length; i++) {
        args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i, Blockly.JavaScript.ORDER_NONE) || 'null');
    }
    return `await ${funcName}(${args.join(', ')});\n`;
};

Blockly.Python['procedures_callreturn'] = function (block) {
  const funcName = Blockly.Python.variableDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.Names.PROCEDURE_NAME,
  );
  const args = [];
  for (let i = 0; i < block.arguments_.length; i++) {
    args.push(Blockly.Python.valueToCode(block, 'ARG' + i, Blockly.Python.ORDER_NONE) || 'None');
  }
  return [`await ${funcName}(${args.join(', ')})`, Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript['procedures_callreturn'] = function (block) {
    const funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Names.PROCEDURE_NAME,);
    const args = [];
    for (let i = 0; i < block.arguments_.length; i++) {
        args.push(Blockly.JavaScript.valueToCode(block, 'ARG' + i, Blockly.JavaScript.ORDER_NONE) || 'null');
    }
    return [`await ${funcName}(${args.join(', ')})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Python['lists_create_with'] = function (block) {
  const elements = [];
  for (let i = 0; i < block.itemCount_; i++) {
    elements.push(
      Blockly.Python.valueToCode(block, 'ADD' + i, Blockly.Python.ORDER_NONE) || 'None',
    );
  }
  return ['[' + elements.join(', ') + ']', Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['lists_create_with'] = function (block) {
    const elements = [];
    for (let i = 0; i < block.itemCount_; i++) {
        elements.push(Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE) || 'null');
    }
    return ['[' + elements.join(', ') + ']', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['lists_length'] = function (block) {
  const list = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '[]';
  return [`len(${list})`, Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript['lists_length'] = function (block) {
    const list = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '[]';
    return [`${list}.length`, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['lists_append_to'] = function (block) {
  const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_MEMBER) || '[]';
  const item = Blockly.Python.valueToCode(block, 'ITEM', Blockly.Python.ORDER_NONE) || 'None';
  return `${list}.append(${item})\n`;
};
Blockly.JavaScript['lists_append_to'] = function (block) {
    const list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_MEMBER) || '[]';
    const item = Blockly.JavaScript.valueToCode(block, 'ITEM', Blockly.JavaScript.ORDER_NONE) || 'null';
    return `${list}.push(${item});\n`;
};

Blockly.Python['random_choice'] = function (block) {
  const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_NONE) || '[]';
  return [`random.choice(${list})`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['random_choice'] = function (block) {
    const list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_NONE) || '[]';
    return [`${list}[Math.floor(Math.random() * ${list}.length)]`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['lists_getIndex'] = function (block) {
  const mode = block.getFieldValue('MODE') || 'GET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const list = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_MEMBER) || '[]';
  let code, at;
  if (where === 'FROM_START') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_ADDITIVE) || '1';
    at = Blockly.isNumber(at) ? parseInt(at, 10) - 1 : `(int(${at}) - 1)`;
    if (mode === 'GET') code = `${list}[${at}]`;
    else if (mode === 'GET_REMOVE') code = `${list}.pop(${at})`;
    else if (mode === 'REMOVE') code = `del ${list}[${at}]\n`;
  } else if (where === 'FROM_END') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_UNARY_SIGN) || '1';
    at = Blockly.isNumber(at) ? -parseInt(at, 10) : `-int(${at})`;
    if (mode === 'GET') code = `${list}[${at}]`;
    else if (mode === 'GET_REMOVE') code = `${list}.pop(${at})`;
    else if (mode === 'REMOVE') code = `del ${list}[${at}]\n`;
  } else if (where === 'FIRST') {
    if (mode === 'GET') code = `${list}[0]`;
    else if (mode === 'GET_REMOVE') code = `${list}.pop(0)`;
    else if (mode === 'REMOVE') code = `del ${list}[0]\n`;
  } else if (where === 'LAST') {
    if (mode === 'GET') code = `${list}[-1]`;
    else if (mode === 'GET_REMOVE') code = `${list}.pop()`;
    else if (mode === 'REMOVE') code = `del ${list}[-1]\n`;
  } else {
    return Blockly.Python.lists_getIndex(block);
  }
  if (mode === 'REMOVE') return code;
  return [code, Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript['lists_getIndex'] = function (block) {
    const mode = block.getFieldValue('MODE') || 'GET';
    const where = block.getFieldValue('WHERE') || 'FROM_START';
    const list = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_MEMBER) || '[]';
    let code, at;
    if (where === 'FROM_START') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_ADDITIVE) || '1';
        at = at.match(/^-?\d+$/) ? parseInt(at, 10) - 1 : `(${at} - 1)`;
        if (mode === 'GET') code = `${list}[${at}]`;
        else if (mode === 'GET_REMOVE') code = `${list}.splice(${at}, 1)[0]`;
        else if (mode === 'REMOVE') code = `${list}.splice(${at}, 1);\n`;
    } else if (where === 'FROM_END') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_UNARY_SIGN) || '1';
        at = at.match(/^-?\d+$/) ? parseInt(at, 10) - 1 : `(${at} - 1)`;
        if (mode === 'GET') code = `${list}.slice(-${at})[0]`;
        else if (mode === 'GET_REMOVE') code = `${list}.splice(-${at}, 1)[0]`;
        else if (mode === 'REMOVE') code = `${list}.splice(-${at}, 1);\n`;
    } else if (where === 'FIRST') {
        if (mode === 'GET') code = `${list}[0]`;
        else if (mode === 'GET_REMOVE') code = `${list}.shift()`;
        else if (mode === 'REMOVE') code = `${list}.shift();\n`;
    } else if (where === 'LAST') {
        if (mode === 'GET') code = `${list}[${list}.length - 1]`;
        else if (mode === 'GET_REMOVE') code = `${list}.pop()`;
        else if (mode === 'REMOVE') code = `${list}.pop();\n`;
    } else {
        return '';
    }
    if (mode === 'REMOVE') return code;
    return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['lists_setIndex'] = function (block) {
  const mode = block.getFieldValue('MODE') || 'SET';
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_MEMBER) || '[]';
  const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
  let code, at;
  if (where === 'FROM_START') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_ADDITIVE) || '1';
    at = Blockly.isNumber(at) ? parseInt(at, 10) - 1 : `(int(${at}) - 1)`;
    if (mode === 'SET') code = `${list}[${at}] = ${value}\n`;
    else if (mode === 'INSERT') code = `${list}.insert(${at}, ${value})\n`;
  } else if (where === 'FIRST') {
    if (mode === 'SET') code = `${list}[0] = ${value}\n`;
    else if (mode === 'INSERT') code = `${list}.insert(0, ${value})\n`;
  } else if (where === 'LAST') {
    if (mode === 'SET') code = `${list}[-1] = ${value}\n`;
    else if (mode === 'INSERT') code = `${list}.append(${value})\n`;
  } else if (where === 'FROM_END') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_UNARY_SIGN) || '1';
    if (mode === 'SET') {
      const setAt = Blockly.isNumber(at) ? -parseInt(at, 10) : `-int(${at})`;
      code = `${list}[${setAt}] = ${value}\n`;
    } else if (mode === 'INSERT') {
      const insertAt = Blockly.isNumber(at)
        ? `len(${list}) - ${parseInt(at, 10)}`
        : `len(${list}) - int(${at})`;
      code = `${list}.insert(${insertAt}, ${value})\n`;
    }
  } else {
    return Blockly.Python.lists_setIndex(block);
  }
  return code;
};
Blockly.JavaScript['lists_setIndex'] = function (block) {
    const mode = block.getFieldValue('MODE') || 'SET';
    const where = block.getFieldValue('WHERE') || 'FROM_START';
    const list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_MEMBER) || '[]';
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || 'null';
    let code, at;
    if (where === 'FROM_START') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_ADDITIVE) || '1';
        at = at.match(/^-?\d+$/) ? parseInt(at, 10) - 1 : `(${at} - 1)`;
        if (mode === 'SET') code = `${list}[${at}] = ${value};\n`;
        else if (mode === 'INSERT') code = `${list}.splice(${at}, 0, ${value});\n`;
    } else if (where === 'FIRST') {
        if (mode === 'SET') code = `${list}[0] = ${value};\n`;
        else if (mode === 'INSERT') code = `${list}.unshift(${value});\n`;
    } else if (where === 'LAST') {
        if (mode === 'SET') code = `${list}[${list}.length - 1] = ${value};\n`;
        else if (mode === 'INSERT') code = `${list}.push(${value});\n`;
    } else if (where === 'FROM_END') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_UNARY_SIGN) || '1';
        if (mode === 'SET') {
            const setAt = at.match(/^-?\d+$/) ? -parseInt(at, 10) : `-(${at})`;
            code = `${list}[${list}.length ${setAt}] = ${value};\n`;
        } else if (mode === 'INSERT') {
            const insertAt = at.match(/^-?\d+$/) ? `${list}.length - ${parseInt(at, 10)}` : `${list}.length - ${at}`;
            code = `${list}.splice(${insertAt}, 0, ${value});\n`;
        }
    } else {
        return '';
    }
    return code;
};

Blockly.Python['random_integer'] = function (block) {
  const from = Blockly.Python.valueToCode(block, 'FROM', Blockly.Python.ORDER_NONE) || '0';
  const to = Blockly.Python.valueToCode(block, 'TO', Blockly.Python.ORDER_NONE) || '100';
  return [`random.randint(int(${from}), int(${to}))`, Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['random_integer'] = function (block) {
    const from = Blockly.JavaScript.valueToCode(block, 'FROM', Blockly.JavaScript.ORDER_NONE) || '0';
    const to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_NONE) || '100';
    return [`Math.floor(Math.random() * (${to} - ${from} + 1)) + Number(${from})`, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['text_replace'] = function (block) {
  const text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_MEMBER) || "''";
  const from = Blockly.Python.valueToCode(block, 'FROM', Blockly.Python.ORDER_NONE) || "''";
  const to = Blockly.Python.valueToCode(block, 'TO', Blockly.Python.ORDER_NONE) || "''";
  return [`str(${text}).replace(str(${from}), str(${to}))`, Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript['text_replace'] = function (block) {
    const text = Blockly.JavaScript.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_MEMBER) || "''";
    const from = Blockly.JavaScript.valueToCode(block, 'FROM', Blockly.JavaScript.ORDER_NONE) || "''";
    const to = Blockly.JavaScript.valueToCode(block, 'TO', Blockly.JavaScript.ORDER_NONE) || "''";
    return [`${text}.replace(${from}, ${to})`, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['text_charAt'] = function (block) {
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const text = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_MEMBER) || "''";
  let code, at;
  if (where === 'FROM_START') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_ADDITIVE) || '1';
    at = Blockly.isNumber(at) ? parseInt(at, 10) - 1 : `(int(${at}) - 1)`;
    code = `${text}[${at}]`;
  } else if (where === 'FIRST') {
    code = `${text}[0]`;
  } else if (where === 'LAST') {
    code = `${text}[-1]`;
  } else if (where === 'FROM_END') {
    at = Blockly.Python.valueToCode(block, 'AT', Blockly.Python.ORDER_UNARY_SIGN) || '1';
    at = Blockly.isNumber(at) ? -parseInt(at, 10) : `-int(${at})`;
    code = `${text}[${at}]`;
  } else {
    code = `${text}[0]`;
  }
  return [code, Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript['text_charAt'] = function (block) {
    const where = block.getFieldValue('WHERE') || 'FROM_START';
    const text = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_MEMBER) || "''";
    let code, at;
    if (where === 'FROM_START') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_ADDITIVE) || '1';
        at = at.match(/^-?\d+$/) ? parseInt(at, 10) - 1 : `(${at} - 1)`;
        code = `${text}.charAt(${at})`;
    } else if (where === 'FIRST') {
        code = `${text}.charAt(0)`;
    } else if (where === 'LAST') {
        code = `${text}.charAt(${text}.length - 1)`;
    } else if (where === 'FROM_END') {
        at = Blockly.JavaScript.valueToCode(block, 'AT', Blockly.JavaScript.ORDER_UNARY_SIGN) || '1';
        at = at.match(/^-?\d+$/) ? parseInt(at, 10) : `${at}`;
        code = `${text}.slice(-${at}).charAt(0)`;
    } else {
        code = `${text}.charAt(0)`;
    }
    return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['controls_if'] = function (block) {
  let code = '';
  let condition = Blockly.Python.valueToCode(block, 'IF0', Blockly.Python.ORDER_NONE) || 'False';
  let branchCode = getBranchCode(block, 'DO0');
  code += `if ${condition}:\n${branchCode}`;
  for (let i = 1; i <= block.elseifCount_; i++) {
    condition = Blockly.Python.valueToCode(block, 'IF' + i, Blockly.Python.ORDER_NONE) || 'False';
    branchCode = getBranchCode(block, 'DO' + i);
    code += `elif ${condition}:\n${branchCode}`;
  }
  if (block.elseCount_) {
    branchCode = getBranchCode(block, 'ELSE');
    code += `else:\n${branchCode}`;
  }
  return code;
};
Blockly.JavaScript['controls_if'] = function (block) {
    let code = '';
    let condition = Blockly.JavaScript.valueToCode(block, 'IF0', Blockly.JavaScript.ORDER_NONE) || 'false';
    let branchCode = Blockly.JavaScript.statementToCode(block, 'DO0');
    code += `if (${condition}) {\n${branchCode}}`;
    for (let i = 1; i <= block.elseifCount_; i++) {
        condition = Blockly.JavaScript.valueToCode(block, 'IF' + i, Blockly.JavaScript.ORDER_NONE) || 'false';
        branchCode = Blockly.JavaScript.statementToCode(block, 'DO' + i);
        code += ` else if (${condition}) {\n${branchCode}}`;
    }
    if (block.elseCount_) {
        branchCode = Blockly.JavaScript.statementToCode(block, 'ELSE');
        code += ` else {\n${branchCode}}`;
    }
    return code + '\n';
};
Blockly.Python['json_load'] = function (block) {
  const filename =
    Blockly.Python.valueToCode(block, 'FILENAME', Blockly.Python.ORDER_NONE) || '"data.json"';
  return [`_load_json_data(${filename})`, Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript['json_load'] = function (block) {
    const filename = Blockly.JavaScript.valueToCode(block, 'FILENAME', Blockly.JavaScript.ORDER_NONE) || '"data.json"';
    return [`_load_json_data(${filename})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Python['json_save'] = function (block) {
  const data = Blockly.Python.valueToCode(block, 'DATA', Blockly.Python.ORDER_NONE) || '{}';
  const filename =
    Blockly.Python.valueToCode(block, 'FILENAME', Blockly.Python.ORDER_NONE) || '"data.json"';
  return `_save_json_data(${filename}, ${data})\n`;
};
Blockly.JavaScript['json_save'] = function (block) {
    const data = Blockly.JavaScript.valueToCode(block, 'DATA', Blockly.JavaScript.ORDER_NONE) || '{}';
    const filename = Blockly.JavaScript.valueToCode(block, 'FILENAME', Blockly.JavaScript.ORDER_NONE) || '"data.json"';
    return `_save_json_data(${filename}, ${data});\n`;
};

Blockly.Python['dict_create'] = function (block) {
  return ['{}', Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript['dict_create'] = function (block) {
    return ['{}', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Python['dict_get'] = function (block) {
  const dict = Blockly.Python.valueToCode(block, 'DICT', Blockly.Python.ORDER_MEMBER) || '{}';
  const key = Blockly.Python.valueToCode(block, 'KEY', Blockly.Python.ORDER_NONE) || '""';
  return [`${dict}.get(${key})`, Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript['dict_get'] = function (block) {
    const dict = Blockly.JavaScript.valueToCode(block, 'DICT', Blockly.JavaScript.ORDER_MEMBER) || '{}';
    const key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || '""';
    return [`${dict}[${key}]`, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Python['dict_set'] = function (block) {
  const dict = Blockly.Python.valueToCode(block, 'DICT', Blockly.Python.ORDER_MEMBER) || 'data';
  const key = Blockly.Python.valueToCode(block, 'KEY', Blockly.Python.ORDER_NONE) || '""';
  const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
  return `${dict}[${key}] = ${value}\n`;
};
Blockly.JavaScript['dict_set'] = function (block) {
    const dict = Blockly.JavaScript.valueToCode(block, 'DICT', Blockly.JavaScript.ORDER_MEMBER) || 'data';
    const key = Blockly.JavaScript.valueToCode(block, 'KEY', Blockly.JavaScript.ORDER_NONE) || '""';
    const value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || 'null';
    return `${dict}[${key}] = ${value};\n`;
};

export default Blockly;
