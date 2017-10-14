var game = {
	player: null,
	key: null,
	signedOn: 0,
	userName: null,
	userSides: ['left', 'right'],
	playerID: 0,
	opponent: null,
	round: 1,
	choices: ['Rock','Paper','Scissors'],
	ready: 0
}

var db = firebase.database()


$("#submitInput").on('click', function(event) {
	event.preventDefault()
	game.userName = $("#userNameInput").val()
	$("#userNameInput").val("")

	db.ref().once("value", function(snapshot) {
		game.signedOn = snapshot.val().signedOn + 1
		game.playerID = game.signedOn
		db.ref().update({
			signedOn: game.signedOn
		})
		game.player = db.ref('/users').push()
		game.key = game.player.key
		game.player.set({
			name: game.userName,
			order: game.signedOn - 2,
		})
	})
})

db.ref('/users').limitToLast(1).on('child_added', function(snapshot) {
	if (game.signedOn < 2) {
		$("#playersList").append(" "+snapshot.val().name)
	} else if (game.signedOn > 2) {
		$("#playersList").append(" "+snapshot.val().order+") "+snapshot.val().name)
	}
})

db.ref('/signedOn').on('value', function(snapshot) {
	if (snapshot.val() === 2) {
		setTimeout(function() {$("#playersList").html("Players Waiting:")}, 200)
		game.gameOn = true
		db.ref('/users').limitToFirst(2).once('value', function(snapshot) {
			var pointer = 0
			$.each(snapshot.val(), function(key, value) {
				$("#"+game.userSides[pointer]+"UserText").append(value.name)
				pointer++
				if (game.playerID === 1 && value.order === 0) {
					game.opponent = value.name
					$("#leftUserControl").css('display', 'block')
					$("#leftRound1").append(game.userName+"...")
					$("#rightRound1").append(game.opponent+"...")
				} else if (game.playerID === 2 && value.order === -1) {
					game.opponent = value.name
					$("#rightUserControl").css('display', 'block')
					$("#rightRound1").append(game.userName+"...")
					$("#leftRound1").append(game.opponent+"...")
				}
			})
		})
		$("#gameCommentary").css("display", "block")
	}	
})

$(".gameBtn").on('click', function() {
	if ($(this).attr('id') === 'rightRock') {
		db.ref().update({
			rightChoice: "Rock"
		})
	} else if ($(this).attr('id') === 'rightPaper') {
		db.ref().update({
			rightChoice: "Paper"
		})
	} else if ($(this).attr('id') === 'rightScissors') {
		db.ref().update({
			rightChoice: "Scissors"
		})
	} else if ($(this).attr('id') === 'leftRock') {
		db.ref().update({
			leftChoice: "Rock"
		})
	} else if ($(this).attr('id') === 'leftPaper') {
		db.ref().update({
			leftChoice: "Paper"
		})
	} else if ($(this).attr('id') === 'leftScissors') {
		db.ref().update({
			leftChoice: "Scissors"
		})
	}
})

db.ref('/rightChoice').on('value', function(snapshot) {
	if (game.choices.indexOf(snapshot.val()) !== -1) {

		$('#rightRound'+game.round).css('display', 'none')
		game.ready++
	}
	if (game.ready === 2) {
		db.ref().once('value', function(snapshot){
			compare(snapshot.val().leftChoice, snapshot.val().rightChoice)
		})
	}
})

db.ref('/leftChoice').on('value', function(snapshot) {
	if (game.choices.indexOf(snapshot.val()) !== -1) {
		$('#leftRound'+game.round).css('display', 'none')
		game.ready++
	}
	if (game.ready === 2) {
		db.ref().once('value', function(snapshot){
			console.log(snapshot.val().leftChoice, snapshot.val().rightChoice)
			compare(snapshot.val().leftChoice, snapshot.val().rightChoice)
		})
	}
})

var compare = function(leftChoice, rightChoice) {
	var dif = game.choices.indexOf(leftChoice) - game.choices.indexOf(rightChoice)
	var winner, loser
	if (dif === 0) {
		db.ref().update({
			result: "Both users chose: "+leftChoice+"</br>Nobody wins round "+parseInt(game.round)
		})
		db.ref('/result').once('value', function(snapshot) {
			$('#resultRound'+parseInt(game.round)).html(snapshot.val())
		})
	} else if (dif === 1) {
		db.ref('/users').once('value', function(snapshot) {
			$.each(snapshot.val(), function(key, value) {
				if (value.order === -1) {
					winner = value.name
				} else if (value.order === 0) {
					loser = value.name
				}
				db.ref().update({
					result: winner+" wins round "+parseInt(game.round)
				})
			})
			$('#leftRound'+game.round).css('display', 'block') 
			$('#leftRound'+game.round).html(winner+" chose "+leftChoice)
			$('#rightRound'+game.round).css('display', 'block')
			$('#rightRound'+game.round).html(loser+" chose "+rightChoice)
			db.ref('/result').once('value', function(snapshot) {
				$('#resultRound'+parseInt(game.round)).html(snapshot.val())
			})
		})
	} else if (dif === -1) {
		db.ref('/users').once('value', function(snapshot) {
			$.each(snapshot.val(), function(key, value) {
				if (value.order === 0) {
					winner = value.name
				} else if (value.order === -1) {
					loser = value.name
				}
				db.ref().update({
					result: winner+" wins round "+parseInt(game.round)
				})
			})
			$('#leftRound'+game.round).css('display', 'block') 
			$('#leftRound'+game.round).html(loser+" chose "+leftChoice)
			$('#rightRound'+game.round).css('display', 'block')
			$('#rightRound'+game.round).html(winner+" chose "+rightChoice)
			db.ref('/result').once('value', function(snapshot) {
				$('#resultRound'+parseInt(game.round)).html(snapshot.val())
			})
		})
	} else if (dif === 2) {
		db.ref('/users').once('value', function(snapshot) {
			$.each(snapshot.val(), function(key, value) {
				if (value.order === 0) {
					winner = value.name
				} else if (value.order === -1) {
					loser = value.name
				}
				db.ref().update({
					result: winner+" wins round "+parseInt(game.round)
				})
			})
		})
	} else if (dif === -2) {
		db.ref('/users').once('value', function(snapshot) {
			$.each(snapshot.val(), function(key, value) {
				if (value.order === -1) {
					winner = value.name
				}
				db.ref().update({
					result: winner+"wins round "+parseInt(game.round)
				})
			})
		})
	}
	setTimeout(function() {
		db.ref().update({
		leftChoice: "null",
		rightChoice: "null"
	})
	}, 200)
	game.round += .5
	game.ready = 0
}

window.onbeforeunload = function() {
	db.ref().set({
		signedOn: 0
	})
}
