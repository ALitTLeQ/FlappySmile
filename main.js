var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game');
var bestScore = 0;
var mainState = {
    preload: function(){
        game.load.image('bird','assets/smile.png');
        game.load.image('pipe','assets/rock.png');
        game.load.image("cloud", "assets/cloud.png");
        game.load.image("background", "assets/background.png");
        game.load.audio('pass', 'assets/pass.mp3');
        game.load.audio('lose', 'assets/lose.mp3');
    },
    create: function(){
        this.background = this.game.add.sprite(-1, -1, 'background');
        this.isRunning = false;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //顯示分數
        this.score = -1;
        this.labelScore = game.add.text
        (180, 190, "0", {font:"100px Arial", fill:"#F25E5E"});

        this.bestScore = game.add.text
        (30, 20, "BEST : "+bestScore, {font:"30px Arial", fill:"#FFCC00"});

        //Sound
        this.sound_pass = game.add.audio('pass');
        this.sound_lose = game.add.audio('lose');

        //Cloud
        this.cloud = this.game.add.tileSprite(0, 60, 400, 71, 'cloud');
        this.cloud.autoScroll(-100, 0);

        //Bird
        this.bird = this.game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        this.game.input.onDown.add(this.jump, this);

        //Pipe
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');

        //每1.5秒產生一列pipe
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        
    },
    update: function(){
        if(this.bird.inWorld == false)
            this.restartGame();

        if(this.isRunning)
        {
            game.time.events.resume();
            this.bird.body.gravity.y = 1000;
            game.physics.arcade.overlap
            (this.bird, this.pipes, this.hitPipe, null, this);

            game.physics.arcade.overlap
            (this.bird, this.emptyHoles, this.hitHole, null, this);
        }
        else
        {
            game.time.events.pause();
        }
    },
    hitPipe: function(){
        if( this.bird.alive == false ) return;

        this.bird.alive = false;

        this.sound_lose.play();

        game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);


    },
    jump: function(){
        if( this.bird.alive == false ) return;

        this.bird.body.velocity.y = -350;
        this.isRunning = true;
    },
    restartGame: function(){
        if(this.score > bestScore)
            bestScore = this.score;
        game.state.start('main');
    },
    addOnePipe: function(x, y) {
        var pipe = this.pipes.getFirstDead();

        //設定pipe位置
        pipe.reset(x, y);

        //加上x方向速度
        pipe.body.velocity.x = -200;

        //移除越過邊界的pipe
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    addRowOfPipes: function() {
        //隨機產生空洞
        var hole = Math.floor(Math.random() * 5) + 1;

        //加上其他六個pipe
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 60 + 10);

        this.score += 1;
        this.labelScore.text = this.score;

        //播放音效
        if(this.score > 0)
            this.sound_pass.play();
    }
};

game.state.add('main', mainState);
game.state.start('main');
