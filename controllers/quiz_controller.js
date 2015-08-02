var models = require('../models/models.js');

// GET /quizes/:id
exports.load = function (req, res, next, quizId){
	console.log('Valor de quizId es:' + quizId);
	models.Quiz.findById(quizId).then(
		function(quiz){
			if (quiz) {
				req.quiz = quiz;
				next();
			}else { next (new Error("No existe el quizId=" + quizId)); }
		}
	).catch (function(error){next(error);});
	
};

// GET /quizes/:id
exports.show = function (req,res){
	res.render('quizes/show',{quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function (req,res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto'
	}
	res.render('quizes/answer',{quiz: req.quiz, respuesta: resultado});
};

// GET /quizes/
exports.index = function (req,res){
	texto_buscar = '%';
	if (req.query.search)
	{
		texto_buscar += req.query.search.replace(' ','%') + '%';

	}
	console.log("Texto a buscar:" + texto_buscar);
	models.Quiz.findAll({where: ["pregunta like ?", texto_buscar],order: [['pregunta', 'ASC']]}).then(
		function(quizes){
			res.render('quizes/index.ejs',{quizes: quizes});
		}
	).catch(function(error){next (error);});
};


// GET /author
exports.author = function (req,res){
	res.render('author');
};