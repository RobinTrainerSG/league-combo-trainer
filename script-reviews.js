// Load existing feedbacks
let feedbacks = JSON.parse(localStorage.getItem('leagueFeedbacks')) || [];
let hasSubmittedReview = localStorage.getItem('hasSubmittedReview') === 'true';

function updateCounters() {
  const likes = feedbacks.filter(fb => fb.reaction === 'like').length;
  const dislikes = feedbacks.filter(fb => fb.reaction === 'dislike').length;
  document.getElementById('likeCounter').innerText = likes;
  document.getElementById('dislikeCounter').innerText = dislikes;
}

function showReviews() {
  const reviewsList = document.getElementById('reviewsList');
  reviewsList.innerHTML = '';

  feedbacks.forEach(feedback => {
    const div = document.createElement('div');
    div.style.marginBottom = "20px";
    div.style.padding = "10px";
    div.style.background = "rgba(255,255,255,0.1)";
    div.style.borderRadius = "10px";
    div.innerHTML = `<strong>${feedback.ign}</strong> | Server: ${feedback.server}<br>
    "${feedback.comment}"<br>
    Reaction: ${feedback.reaction === 'like' ? '👍' : '👎'}`;
    reviewsList.appendChild(div);
  });
}

function checkIfAlreadySubmitted() {
  if (hasSubmittedReview) {
    document.getElementById('feedbackForm').style.display = 'none';
    document.getElementById('thankYouMessage').style.display = 'block';
  }
}

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const ign = document.getElementById('ign').value.trim();
  const server = document.getElementById('server').value.trim();
  const comment = document.getElementById('comment').value.trim();
  const reaction = document.querySelector('input[name="reaction"]:checked').value;

  const newFeedback = { ign, server, comment, reaction };
  feedbacks.push(newFeedback);
  localStorage.setItem('leagueFeedbacks', JSON.stringify(feedbacks));
  localStorage.setItem('hasSubmittedReview', 'true');

  hasSubmittedReview = true;
  checkIfAlreadySubmitted();
  updateCounters();
  showReviews();
});

// Initialize
checkIfAlreadySubmitted();
updateCounters();
showReviews();

