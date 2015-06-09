var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

var mainState = {
    preload: function(){
        game.stage.backgroundColor = '#ffc';
        game.load.image('bird','assets/smile.png');
        game.load.image('pipe','assets/rock.png');
    },
    create: function(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //Bird
        this.bird = this.game.add.sprite(100, 245, 'bird');
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        //Pipe
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');

        //每1.5秒產生一列pipe
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        //顯示分數
        this.score = -1;
        this.labelScore = game.add.text
            (20, 20, "0", {font:"30px Arial", fill:"#000"});

    },
    update: function(){
        if(this.bird.inWorld == false)
            this.restartGame();
        game.physics.arcade.overlap
        (this.bird, this.pipes, this.hitPipe, null, this);

        game.physics.arcade.overlap
        (this.bird, this.emptyHoles, this.hitHole, null, this);
    },
    hitPipe: function(){
        if( this.bird.alive == false ) return;

        this.bird.alive = false;

        game.time.events.remove(this.timer);

        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },
    jump: function(){
        if( this.bird.alive == false ) return;

        this.bird.body.velocity.y = -350;
    },
    restartGame: function(){
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
    }
};

game.state.add('main', mainState);
game.state.start('main');
