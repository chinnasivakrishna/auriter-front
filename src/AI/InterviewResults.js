import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const InterviewResults = ({ analysis, questions, responses }) => {
  const navigate = useNavigate();

  const data = {
    labels: questions.map((q, index) => `Q${index + 1}`),
    datasets: [
      {
        label: 'Performance',
        data: analysis.scores,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Interview Results</h1>
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
          <div className="h-60">
            <Line data={data} options={{ 
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }} />
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Detailed Analysis</h2>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-md">
                <h3 className="font-medium">Question {index + 1}:</h3>
                <p className="text-gray-700 mb-2">{question}</p>
                <h3 className="font-medium mt-2">Your Response:</h3>
                <p className="text-gray-700 mb-2">{responses[index]}</p>
                <h3 className="font-medium mt-2">Feedback:</h3>
                <p className="text-gray-800">{analysis.details[index]}</p>
                <div className="mt-2 flex items-center">
                  <div className="font-medium mr-2">Score:</div>
                  <div className={`px-2 py-1 rounded-md ${
                    analysis.scores[index] >= 80 ? 'bg-green-100 text-green-800' :
                    analysis.scores[index] >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.scores[index]}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Skill Improvement Suggestions</h2>
          <ul className="list-disc pl-6 space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-800">{suggestion}</li>
            ))}
          </ul>
        </div>
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;