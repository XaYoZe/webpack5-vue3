<template>
  <div class="key-board">
    <div class="key-grop-1">
      <div class="function-grop">
        <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in Fun" :key="key.keyCode"><span>{{key.key}}</span></div>
      </div>
      <div class="main-grop">
        <div class="row-1">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in main[0]" :key="key.keyCode"><span>{{key.key}}</span></div>
        </div>
        <div class="row-2">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in main[1]" :key="key.keyCode"><span>{{key.key}}</span></div>
        </div>
        <div class="row-3">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in main[2]" :key="key.keyCode"><span>{{key.key}}</span></div>
        </div>
        <div class="row-4">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in main[3]" :key="key.keyCode"><span>{{key.key}}</span></div>
        </div>
        <div class="row-5">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in main[4]" :key="key.keyCode"><span>{{key.key}}</span></div>
        </div>
      </div>
    </div>
    <div class="key-grop-2">
      <div class="function-grop-1">
        <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in Fun1" :key="key.keyCode"><span>{{key.key}}</span></div>
      </div>
      <div class="edit-arrow-grop">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in Edit" :key="key.keyCode"><span>{{key.key}}</span></div>
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in Arrow" :key="key.keyCode"><span>{{key.key}}</span></div>
      </div>
    </div>
    <div class="key-grop-3">
      <div class="media-grop">
            <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in media" :key="key.keyCode"><span>{{key.key}}</span></div>
      </div>
      <div class="number-grop">
        <div class="key" :class="[key.code, {down: keyDownList[key.code]}]" v-for="key in Numpad" :key="key.keyCode"><span>{{key.key}}</span></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    data () {
        return {
            keyDownList: {},
            Edit: [
                {keyCode: 34, code: 'PageDown', key: 'Page\nDown'},
                {keyCode: 33, code: 'PageUp', key: 'Page\nUp'},
                {keyCode: 35, code: 'End', key: 'End'},
                {keyCode: 36, code: 'Home', key: 'Home'},
                {keyCode: 46, code: 'Delete', key: 'Delete'},
                {keyCode: 45, code: 'Insert', key: 'Insert'},
            ],
            Arrow: [
                { keyCode: 37, code: 'ArrowLeft', key: '→'},
                { keyCode: 38, code: 'ArrowUp', key: '↑'},
                { keyCode: 39, code: 'ArrowRight', key: '→'},
                { keyCode: 40, code: 'ArrowDown', key: '↓'},

            ],
            Fun: [
                { keyCode: 27, code: 'Escape', key: 'Escape' },
                { keyCode: 112, code: 'F1', key: 'F1' },
                { keyCode: 113, code: 'F2', key: 'F2' },
                { keyCode: 114, code: 'F3', key: 'F3' },
                { keyCode: 115, code: 'F4', key: 'F4' },
                { keyCode: 116, code: 'F5', key: 'F5' },
                { keyCode: 117, code: 'F6', key: 'F6' },
                { keyCode: 118, code: 'F7', key: 'F7' },
                { keyCode: 119, code: 'F8', key: 'F8' },
                { keyCode: 120, code: 'F9', key: 'F9' },
                { keyCode: 121, code: 'F10', key: 'F10' },
                { keyCode: 122, code: 'F11', key: 'F11' },
                { keyCode: 123, code: 'F12', key: 'F12' },
            ],
            Fun1: [
                { keyCode: 45, code: 'PrintScreen', key: 'Print\nScreen' },
                { keyCode: 145, code: 'ScrollLock', key: 'Scroll\nLock' },
                { keyCode: 19, code: 'Pause', key: 'Pause' },
            ],
            Numpad: [
                { keyCode: 13, code: 'NumpadEnter', key: 'Enter' },
                { keyCode: 96, code: 'Numpad0', key: '0' },
                { keyCode: 97, code: 'Numpad1', key: '1' },
                { keyCode: 98, code: 'Numpad2', key: '2' },
                { keyCode: 99, code: 'Numpad3', key: '3' },
                { keyCode: 100, code: 'Numpad4', key: '4' },
                { keyCode: 101, code: 'Numpad5', key: '5' },
                { keyCode: 102, code: 'Numpad6', key: '6' },
                { keyCode: 103, code: 'Numpad7', key: '7' },
                { keyCode: 104, code: 'Numpad8', key: '8' },
                { keyCode: 105, code: 'Numpad9', key: '9' },
                { keyCode: 105, code: 'Numpad9', key: '9' },
                { keyCode: 106, code: 'NumpadMultiply', key: '*' },
                { keyCode: 107, code: 'NumpadAdd', key: '+' },
                { keyCode: 109, code: 'NumpadSubtract', key: '-' },
                { keyCode: 110, code: 'NumpadDecimal', key: '.' },
                { keyCode: 111, code: 'NumpadDivide', key: '/' },
                { keyCode: 144, code: 'NumLock', key: 'NumLock' },
            ],
            main: [
                [
                    { keyCode: 192, code: 'Backquote', key: '`'},
                    { keyCode: 49, code: 'Digit1', key: '1'},
                    { keyCode: 50, code: 'Digit2', key: '2'},
                    { keyCode: 51, code: 'Digit3', key: '3'},
                    { keyCode: 52, code: 'Digit4', key: '4'},
                    { keyCode: 53, code: 'Digit5', key: '5'},
                    { keyCode: 54, code: 'Digit6', key: '6'},
                    { keyCode: 55, code: 'Digit7', key: '7'},
                    { keyCode: 56, code: 'Digit8', key: '8'},
                    { keyCode: 57, code: 'Digit9', key: '9'},
                    { keyCode: 48, code: 'Digit0', key: '0'},
                    { keyCode: 189 , code: 'Minus', key: '-'},
                    { keyCode: 187 , code: 'Equal', key: '='},
                    { keyCode: 8 , code: 'Backspace', key: 'Backspace'},
                ],
                [
                    { keyCode: 9, code: 'Tab', key: 'Tab'},
                    { keyCode: 81, code: 'KeyQ', key: 'q'},
                    { keyCode: 87, code: 'KeyW', key: 'w'},
                    { keyCode: 69, code: 'KeyE', key: 'e'},
                    { keyCode: 82, code: 'KeyR', key: 'r'},
                    { keyCode: 84, code: 'KeyT', key: 't'},
                    { keyCode: 89, code: 'KeyY', key: 'y'},
                    { keyCode: 85, code: 'KeyU', key: 'u'},
                    { keyCode: 73, code: 'KeyI', key: 'i'},
                    { keyCode: 79, code: 'KeyO', key: 'o'},
                    { keyCode: 80, code: 'KeyP', key: 'p'},
                    { keyCode: 219, code: 'BracketLeft', key: '['},
                    { keyCode: 221, code: 'BracketRight', key: ']'},
                    { keyCode: 220, code: 'Backslash', key: '\\'},
                ],
                [
                    {keyCode: 20, code: 'CapsLock', key: 'CapsLock'},
                    {keyCode: 65, code: 'KeyA', key: 'a'},
                    {keyCode: 83, code: 'KeyS', key: 's'},
                    {keyCode: 68, code: 'KeyD', key: 'd'},
                    {keyCode: 70, code: 'KeyF', key: 'f'},
                    {keyCode: 71, code: 'KeyG', key: 'g'},
                    {keyCode: 72, code: 'KeyH', key: 'h'},
                    {keyCode: 74, code: 'KeyJ', key: 'j'},
                    {keyCode: 75, code: 'KeyK', key: 'k'},
                    {keyCode: 76, code: 'KeyL', key: 'l'},
                    {keyCode: 186, code: 'Semicolon', key: ';'},
                    {keyCode: 222, code: 'Quote', key: "'"},
                    {keyCode: 13, code: 'Enter', key: 'Enter'},
                ], [
                    {keyCode: 16, code: 'ShiftLeft', key: 'Shift'},
                    {keyCode: 90, code: 'KeyZ', key: 'z'},
                    {keyCode: 88, code: 'KeyX', key: 'x'},
                    {keyCode: 67, code: 'KeyC', key: 'c'},
                    {keyCode: 86, code: 'KeyV', key: 'v'},
                    {keyCode: 66, code: 'KeyB', key: 'b'},
                    {keyCode: 78, code: 'KeyN', key: 'n'},
                    {keyCode: 77, code: 'KeyM', key: 'm'},
                    {keyCode: 188, code: 'Comma', key: ','},
                    {keyCode: 190, code: 'Period', key: '.'},
                    {keyCode: 191, code: 'Slash', key: '/'},
                    {keyCode: 16, code: 'ShiftRight', key: 'Shift'},
                ],
                [
                    { keyCode: 17, code: 'ControlLeft', key: 'Control' },
                    { keyCode: 91, code: 'MetaLeft', key: 'Meta' },
                    { keyCode: 18, code: 'AltLeft', key: 'Alt' },
                    { keyCode: 32, code: 'Space', key: ' ' },
                    { keyCode: 18, code: 'AltRight', key: 'Alt' },
                    { keyCode: 92, code: 'MetaRight', key: 'Meta' },
                    { keyCode: 0, code: 'Function', key: 'Fn' },
                    { keyCode: 17, code: 'ControlRight', key: 'Control' },
                ]
            ],
            media: [
                { keyCode: 181, code: 'LaunchMediaPlayer', key: 'Player' },
                { keyCode: 180, code: 'LaunchMail', key: 'Mail' },
                { keyCode: 183, code: 'LaunchApplication2', key: 'Application2' },
                { keyCode: 182, code: 'LaunchApplication1', key: 'Application1' },
            ]
        }
    },
    mounted () {
        document.addEventListener('keydown', (event) =>{
            console.log(event.keyCode,event.code,  event.key);
            this.keyDownList[event.code] = true;
            event.preventDefault();
        }, false)
        document.addEventListener('keyup', (event) => {
            console.log(event.keyCode,event.code,  event.key);
            this.keyDownList[event.code] = false
        }, false)
    }
}
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
      grid-template: $keySize / repeat(2, $keySize) repeat(4, $keySize) calc(0.5 * $keySize) repeat(4, $keySize) calc(0.5 * $keySize) repeat(4, $keySize) ;
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
        grid-template-areas: 'Backquote Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0 Minus Equal Backspace';
      }
      .row-2 {
        grid-template-columns: calc($keySize * 1.5) repeat(12, $keySize) calc($keySize * 1.5);
        grid-template-areas: 'Tab KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP';
      }
      .row-3 {
        grid-template-columns: calc($keySize * 1.75) repeat(11, $keySize) calc($keySize * 2.25);
        grid-template-areas:  'CapsLock KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon';
      }
      .row-4 {
        grid-template-columns: calc($keySize * 2.25) repeat(10, $keySize) calc($keySize * 2.75);
        grid-template-areas: 'ShiftLeft KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash ShiftRight';
      }
      .row-5 {
        grid-template-columns: repeat(3, calc($keySize * 1.25)) calc($keySize * 6.25) repeat(4, calc($keySize * 1.25));
          grid-template-areas: 'ControlLeft MetaLeft AltLeft Space AltRight MetaRight Function ControlRight'; }
    }
  }
  .key-grop-2 {
    .function-grop-1 {
      display: grid;
      grid-template-columns:  repeat(3, calc($keySize));
      grid-template-areas: 'PrintScreen ScrollLock Pause';
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
     &.down span{
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