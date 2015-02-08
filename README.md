# King's Guard: Archer Defense

King's Guard: Archer Defense is a HTML5 action/tower defense hybrid video game.

You can play it <a href="https://likadev.github.io/kings-guard-archer-defense/">here</a>. But it probably doesn't work yet.

### Languages, Frameworks, and Libraries

* HTML5/CSS markup is used as a shell for the game instance.
* <a href="https://www.dartlang.org/">Dart</a> is used to create the client-side game code. The Dart code is compiled to JavaScript.
* The game framework used is <a href="https://phaser.io/">Phaser</a>.
* Since we're developing in Dart, we must use the <a href="https://github.com/playif/play_phaser">play_phaser</a> Dart port of Phaser.


### Tools

* The <a href="http://darkfunction.com/editor/">darkFunction Editor</a> is used to generate the spritesheets and animation data. I intend to patch the code for the editor to be able to export directly to the texture atlas format that Phaser understands (currently, this conversion is done under AnimationLoader.ts).

This game is a work in progress. Don't expect much anytime soon.

If you're interested in more details, feel free to <a href="mailto:likadev@users.noreply.github.com">contact me</a>.
