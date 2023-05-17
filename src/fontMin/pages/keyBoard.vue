<template>
  <div class="key-board">
    <div class="key-grop-1">
      <div class="function-grop">
        <div
          class="key"
          :class="[key.code, { down: keyDownList[key.code] }]"
          v-for="key in Fun"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
      </div>
      <div class="main-grop">
        <div class="row-1">
          <div
            class="key"
            :class="[key.code, { down: keyDownList[key.code] }]"
            v-for="key in main[0]"
            :key="key.code || key.key"
          >
            <span>{{ key.name }}</span>
          </div>
        </div>
        <div class="row-2">
          <div
            class="key"
            :class="[key.code, { down: keyDownList[key.code] }]"
            v-for="key in main[1]"
            :key="key.code || key.key"
          >
            <span>{{ key.name }}</span>
          </div>
        </div>
        <div class="row-3">
          <div
            class="key"
            :class="[key.code, { down: keyDownList[key.code] }]"
            v-for="key in main[2]"
            :key="key.code || key.key"
          >
            <span>{{ key.name }}</span>
          </div>
        </div>
        <div class="row-4">
          <div
            class="key"
            :class="[key.code, { down: keyDownList[key.code] }]"
            v-for="key in main[3]"
            :key="key.code || key.key"
          >
            <span>{{ key.name }}</span>
          </div>
        </div>
        <div class="row-5">
          <div
            class="key"
            :class="[key.code, { down: keyDownList[key.code] }]"
            v-for="key in main[4]"
            :key="key.code || key.key"
          >
            <span>{{ key.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="key-grop-2">
      <div class="function-grop-1">
        <div
          class="key"
          :class="[key.code, { down: keyDownList[key.code] }]"
          v-for="key in Fun1"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
      </div>
      <div class="edit-arrow-grop">
        <div
          class="key"
          :class="[key.code, { down: keyDownList[key.code] }]"
          v-for="key in Edit"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
        <div
          class="key"
          :class="[key.code, { down: keyDownList[key.code] }]"
          v-for="key in Arrow"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
      </div>
    </div>
    <div class="key-grop-3">
      <div class="media-grop">
        <div
          class="key"
          :class="[
            key.code,
            { down: keyDownList[key.code] || keyDownList[key.key] },
          ]"
          v-for="key in media"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
      </div>
      <div class="number-grop">
        <div
          class="key"
          :class="[key.code, { down: keyDownList[key.code] }]"
          v-for="key in Numpad"
          :key="key.code || key.key"
        >
          <span>{{ key.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      keyDownList: {},
      Edit: [
        { name: "PGDN", code: "PageDown", key: "PageDown" },
        { name: "PGUP", code: "PageUp", key: "PageUp" },
        { name: "END", code: "End", key: "End" },
        { name: "HOME", code: "Home", key: "Home" },
        { name: "DEL", code: "Delete", key: "Delete" },
        { name: "INS", code: "Insert", key: "Insert" },
      ],
      Arrow: [
        { name: "←", code: "ArrowLeft", key: "ArrowLeft" },
        { name: "↑", code: "ArrowUp", key: "ArrowUp" },
        { name: "→", code: "ArrowRight", key: "ArrowRight" },
        { name: "↓", code: "ArrowDown", key: "ArrowDown" },
      ],
      Fun: [
        { name: "ESC", code: "Escape", key: "Escape" },
        { name: "F1", code: "F1", key: "F1" },
        { name: "F2", code: "F2", key: "F2" },
        { name: "F3", code: "F3", key: "F3" },
        { name: "F4", code: "F4", key: "F4" },
        { name: "F5", code: "F5", key: "F5" },
        { name: "F6", code: "F6", key: "F6" },
        { name: "F7", code: "F7", key: "F7" },
        { name: "F8", code: "F8", key: "F8" },
        { name: "F9", code: "F9", key: "F9" },
        { name: "F10", code: "F10", key: "F10" },
        { name: "F11", code: "F11", key: "F11" },
        { name: "F12", code: "F12", key: "F12" },
      ],
      Fun1: [
        { name: "PS", code: "PrintScreen", key: "PrintScreen" },
        { name: "SCR\nLk", code: "ScrollLock", key: "ScrollLock" },
        { name: "PB", code: "Pause", key: "Pause" },
      ],
      Numpad: [
        { name: "↩", code: "NumpadEnter", key: "Enter" },
        { name: "0", code: "Numpad0", key: "0" },
        { name: "1", code: "Numpad1", key: "1" },
        { name: "2", code: "Numpad2", key: "2" },
        { name: "3", code: "Numpad3", key: "3" },
        { name: "4", code: "Numpad4", key: "4" },
        { name: "5", code: "Numpad5", key: "5" },
        { name: "6", code: "Numpad6", key: "6" },
        { name: "7", code: "Numpad7", key: "7" },
        { name: "8", code: "Numpad8", key: "8" },
        { name: "9", code: "Numpad9", key: "9" },
        { name: "9", code: "Numpad9", key: "9" },
        { name: "*", code: "NumpadMultiply", key: "*" },
        { name: "+", code: "NumpadAdd", key: "+" },
        { name: "-", code: "NumpadSubtract", key: "-" },
        { name: ".", code: "NumpadDecimal", key: "." },
        { name: "/", code: "NumpadDivide", key: "/" },
        { name: "NUMLK", code: "NumLock", key: "NumLock" },
      ],
      main: [
        [
          { name: "`", code: "Backquote", key: "`" },
          { name: "1", code: "Digit1", key: "1" },
          { name: "2", code: "Digit2", key: "2" },
          { name: "3", code: "Digit3", key: "3" },
          { name: "4", code: "Digit4", key: "4" },
          { name: "5", code: "Digit5", key: "5" },
          { name: "6", code: "Digit6", key: "6" },
          { name: "7", code: "Digit7", key: "7" },
          { name: "8", code: "Digit8", key: "8" },
          { name: "9", code: "Digit9", key: "9" },
          { name: "0", code: "Digit0", key: "0" },
          { name: "-", code: "Minus", key: "-" },
          { name: "=", code: "Equal", key: "=" },
          { name: "⇤", code: "Backspace", key: "Backspace" },
        ],
        [
          { name: "⇥", code: "Tab", key: "Tab" },
          { name: "Q", code: "KeyQ", key: "q" },
          { name: "W", code: "KeyW", key: "w" },
          { name: "E", code: "KeyE", key: "e" },
          { name: "R", code: "KeyR", key: "r" },
          { name: "T", code: "KeyT", key: "t" },
          { name: "Y", code: "KeyY", key: "y" },
          { name: "U", code: "KeyU", key: "u" },
          { name: "I", code: "KeyI", key: "i" },
          { name: "O", code: "KeyO", key: "o" },
          { name: "P", code: "KeyP", key: "p" },
          { name: "[", code: "BracketLeft", key: "[" },
          { name: "]", code: "BracketRight", key: "]" },
          { name: "\\", code: "Backslash", key: "\\" },
        ],
        [
          { name: "⇄", code: "CapsLock", key: "CapsLock" },
          { name: "A", code: "KeyA", key: "a" },
          { name: "S", code: "KeyS", key: "s" },
          { name: "D", code: "KeyD", key: "d" },
          { name: "F", code: "KeyF", key: "f" },
          { name: "G", code: "KeyG", key: "g" },
          { name: "H", code: "KeyH", key: "h" },
          { name: "J", code: "KeyJ", key: "j" },
          { name: "K", code: "KeyK", key: "k" },
          { name: "L", code: "KeyL", key: "l" },
          { name: ";", code: "Semicolon", key: ";" },
          { name: "'", code: "Quote", key: "'" },
          { name: "↩", code: "Enter", key: "Enter" },
        ],
        [
          { name: "Shift", code: "ShiftLeft", key: "Shift" },
          { name: "Z", code: "KeyZ", key: "z" },
          { name: "X", code: "KeyX", key: "x" },
          { name: "C", code: "KeyC", key: "c" },
          { name: "V", code: "KeyV", key: "v" },
          { name: "B", code: "KeyB", key: "b" },
          { name: "N", code: "KeyN", key: "n" },
          { name: "M", code: "KeyM", key: "m" },
          { name: ",", code: "Comma", key: "," },
          { name: ".", code: "Period", key: "." },
          { name: "/", code: "Slash", key: "/" },
          { name: "Shift", code: "ShiftRight", key: "Shift" },
        ],
        [
          { name: "CTRL", code: "ControlLeft", key: "Control" },
          { name: "WIN", code: "MetaLeft", key: "Meta" },
          { name: "ALT", code: "AltLeft", key: "Alt" },
          { name: " ", code: "Space", key: " " },
          { name: "ALT", code: "AltRight", key: "Alt" },
          { name: "▤", code: "MetaRight", key: "Meta" },
          { name: "Fn", code: "Function", key: "Fn" },
          { name: "CTRL", code: "ControlRight", key: "Control" },
        ],
      ],
      media: [
        // { name: '▶, code: '', key: 'LaunchMediaPlayer' },
        // { name: 180, code: '', key: 'LaunchMail' },
        { name: "App2", code: "", key: "Application2" },
        { name: "Mute", code: "", key: "AudioVolumeMute" },
        { name: "AVDN", code: "", key: "AudioVolumeDown" },
        { name: "AVUP", code: "", key: "AudioVolumeUp" },
        // { name: 182, code: '', key: 'LaunchApplication1' },
      ],
    };
  },
  mounted() {
    document.addEventListener(
      "keydown",
      (event) => {
        console.log(event.code, event.key);
        this.keyDownList[event.code] = true;
        event.preventDefault();
      },
      false
    );
    document.addEventListener(
      "keyup",
      (event) => {
        console.log(event.code, event.key);
        // this.keyDownList[event.code] = false
        event.preventDefault();
      },
      false
    );
  },
};
</script>
<style lang="scss" scoped>
@import "~@style/key.scss";
.key-board {
  --keySize: 50px;
  $keySize: var(--keySize);
  width: max-content;
  margin: 0 auto;
  background-size: 100% 100%;
  border: 15px solid rgb(140, 196, 255);
  background: rgb(140, 196, 255);
  border-radius: 10px;
  display: grid;
  grid-template-columns: max-content max-content max-content;
  grid-gap: 10px;
  .key-grop-1,
  .key-grop-2,
  .key-grop-3 {
    display: grid;
    grid-template-rows: max-content;
    grid-gap: 10px;
  }
  .key-grop-1 {
    .function-grop {
      display: grid;
      grid-template:
        $keySize / repeat(2, $keySize) repeat(4, $keySize) calc(0.5 * $keySize)
        repeat(4, $keySize) calc(0.5 * $keySize) repeat(4, $keySize);
      //   grid-template-rows: $keySize;
      //   grid-template-columns: $keySize / repeat(2, $keySize) repeat(4, $keySize) calc(0.5 * $keySize) repeat(4, $keySize) calc(0.5 * $keySize) repeat(4, $keySize);
      grid-template-areas: "Escape . F1 F2 F3 F4 . F5 F6 F7 F8 . F9 F10 F11 F12";
    }
    .main-grop {
      display: grid;
      grid-template-columns: auto;
      .row-1,
      .row-2,
      .row-3,
      .row-4,
      .row-5 {
        display: grid;
        // grid-template-rows: $keySize;
      }
      .row-1 {
        grid-template-columns: repeat(13, $keySize) calc($keySize * 2);
        grid-template-areas: "Backquote Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal Backspace";
      }
      .row-2 {
        grid-template-columns: calc($keySize * 1.5) repeat(12, $keySize) calc(
            $keySize * 1.5
          );
        grid-template-areas: "Tab KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP";
      }
      .row-3 {
        grid-template-columns: calc($keySize * 1.75) repeat(11, $keySize) calc(
            $keySize * 2.25
          );
        grid-template-areas: "CapsLock KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon";
      }
      .row-4 {
        grid-template-columns: calc($keySize * 2.25) repeat(10, $keySize) calc(
            $keySize * 2.75
          );
        grid-template-areas: "ShiftLeft KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash ShiftRight";
      }
      .row-5 {
        grid-template-columns:
          repeat(3, calc($keySize * 1.25)) calc($keySize * 6.25)
          repeat(4, calc($keySize * 1.25));
        grid-template-areas: "ControlLeft MetaLeft AltLeft Space AltRight MetaRight Function ControlRight";
      }
    }
  }
  .key-grop-2 {
    .function-grop-1 {
      display: grid;
      grid-template-columns: repeat(3, calc($keySize));
      grid-template-areas: "PrintScreen ScrollLock Pause";
    }
    .edit-arrow-grop {
      display: grid;
      grid-template-rows: repeat(5, $keySize);
      grid-template-columns: repeat(3, $keySize);
      //   grid-gap: $keySize;
      grid-template-areas:
        "Insert Home PageUp"
        "Delete End PageDown"
        ". . ."
        ". ArrowUp ."
        "ArrowLeft ArrowDown ArrowRight";
    }
  }
  .key-grop-3 {
    .media-grop {
      display: grid;
      grid-template-columns: repeat(4, $keySize);
      grid-template-rows: $keySize;
    }
    .number-grop {
      display: grid;
      grid-template-columns: repeat(4, $keySize);
      grid-template-rows: repeat(5, $keySize);
      grid-template-areas:
        "NumLock NumpadDivide NumpadMultiply NumpadSubtract"
        "Numpad7 Numpad8      Numpad9        NumpadAdd"
        "Numpad4 Numpad5      Numpad6        NumpadAdd"
        "Numpad1 Numpad2      Numpad3        NumpadEnter"
        "Numpad0 Numpad0      NumpadDecimal  NumpadEnter";
    }
  }
  .key {
    /* width: 50px; */
    min-width: $keySize;
    min-height: $keySize;
    background: #fffa;
    box-sizing: border-box;
    padding: 2px;
    //   height: 50px;
    &.down span {
      background: #fff;
    }
    span {
      display: block;
      height: 100%;
      width: 100%;
      background: rgb(160, 245, 141);
      border: 1px solid #0003;
      box-sizing: border-box;
      text-align: center;
      border-radius: 5px;
      box-shadow: inset 0px 0px 0px 5px #0001;
      font-size: 12px;
      padding-top: 10px;
      line-height: 13px;
      text-align: left;
      display: flex;
      justify-content: center;
      user-select: none;
      position: relative;
      z-index: 1;
      //     content: '';
      //     position: absolute;
      //     z-index: 0;
      //     top: 0;
      //     left: 0;
      //     width: 100%;
      //     height: 100%;
      //     background: #fff;
    }
  }
}
</style>
