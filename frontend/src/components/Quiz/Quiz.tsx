import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, XCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getQuizForCourseApi,
  submitQuizApi,
  checkQuizEligibilityApi,
  getUserQuizAttemptsApi
} from '@/api/student';

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
}

interface QuizAttempt {
  _id: string;
  score: number;
  isPassed: boolean;
  attemptNumber: number;
  completedAt: string;
  timeSpent: number;
}

interface QuizProps {
  courseId: string;
  onClose: () => void;
  onCertificateGenerated?: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ courseId, onClose, onCertificateGenerated }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [quizResponse, eligibilityResponse, attemptsResponse] = await Promise.all([
          getQuizForCourseApi(courseId),
          checkQuizEligibilityApi(courseId),
          getUserQuizAttemptsApi(courseId)
        ]);

        setQuiz(quizResponse.data);
        setEligibility(eligibilityResponse.data);
        setAttempts(attemptsResponse.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load quiz');
        onClose();
      }
    };

    fetchQuizData();
  }, [courseId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (quizStarted && timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizStarted, timeRemaining]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(new Date());
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !startTime) return;

    setIsSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));

      const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);

      const response = await submitQuizApi(courseId, answersArray, timeSpent);
      
      setLastAttempt(response.data);
      setShowResults(true);

      if (response.data.isPassed) {
        toast.success('Congratulations! You passed the quiz!');
        if (response.certificateGenerated && onCertificateGenerated) {
          onCertificateGenerated();
        }
      } else {
        toast.error(`You scored ${response.data.score}%. You need ${quiz.passingScore}% to pass.`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return <div className="text-center">Loading quiz...</div>;
  }

  if (!eligibility?.canTake && !showResults) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="text-red-500" />
            Quiz Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>You cannot take this quiz at the moment.</p>
            <div className="space-y-2">
              <p>Attempts used: {eligibility?.attemptsUsed}/{eligibility?.maxAttempts}</p>
              {eligibility?.hasPassedBefore && (
                <p className="text-green-600">✓ You have already passed this quiz!</p>
              )}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults && lastAttempt) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {lastAttempt.isPassed ? (
              <CheckCircle2 className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {lastAttempt.score}%
              </div>
              <div className="text-lg">
                {lastAttempt.isPassed ? (
                  <span className="text-green-600">PASSED! 🎉</span>
                ) : (
                  <span className="text-red-600">Not Passed</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-semibold">Required Score</div>
                <div>{quiz.passingScore}%</div>
              </div>
              <div>
                <div className="font-semibold">Time Spent</div>
                <div>{formatTime(lastAttempt.timeSpent)}</div>
              </div>
            </div>

            {lastAttempt.isPassed && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="mx-auto mb-2 text-green-600" size={32} />
                <p className="text-green-800">
                  Congratulations! Your certificate has been generated.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button onClick={onClose}>Close</Button>
              {!lastAttempt.isPassed && eligibility && 
               (eligibility.attemptsUsed + 1) < eligibility.maxAttempts && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowResults(false);
                    setQuizStarted(false);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setTimeRemaining(null);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Questions:</span>
                <span>{quiz.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Passing Score:</span>
                <span>{quiz.passingScore}%</span>
              </div>
              {quiz.timeLimit && (
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span>{quiz.timeLimit} minutes</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Attempts Used:</span>
                <span>{eligibility?.attemptsUsed}/{quiz.maxAttempts}</span>
              </div>
            </div>

            {attempts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Previous Attempts:</h4>
                <div className="space-y-1">
                  {attempts.map((attempt) => (
                    <div key={attempt._id} className="flex justify-between text-sm">
                      <span>Attempt {attempt.attemptNumber}</span>
                      <span className={attempt.isPassed ? 'text-green-600' : 'text-red-600'}>
                        {attempt.score}% {attempt.isPassed ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={startQuiz} className="flex-1">
                Start Quiz
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
          {timeRemaining && (
            <div className="flex items-center gap-2 text-red-600">
              <Clock size={16} />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress value={progress} />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{question.question}</h3>
          
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question._id, index)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  answers[question._id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button 
                onClick={handleSubmitQuiz} 
                disabled={isSubmitting || Object.keys(answers).length !== quiz.questions.length}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                disabled={answers[question._id] === undefined}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
