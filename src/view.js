import i18next from 'i18next';
import { watch } from 'melanke-watchjs';

/* eslint no-param-reassign: ["error", { "props": false }] */

const showRSSFeeds = (state) => {
  const { activeFeedId } = state;
  const { elements: { feeds, posts } } = state;

  feeds.innerHtml = '';
  posts.innerHtml = '';

  state.feeds.forEach((feed) => {
    const { title, description, id } = feed;

    const feedContainer = document.createElement('div');

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = description;
    descriptionElement.style.fontSize = '14px';

    if (id !== activeFeedId) {
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = title;
      feedContainer.appendChild(link);

      link.addEventListener('click', (event) => {
        event.preventDefault();
        state.activeFeedId = feed.id;
      });
    } else {
      const titleElement = document.createElement('p');
      titleElement.textContent = title;
      titleElement.style.fontWeight = 'bold';

      feedContainer.appendChild(titleElement);
    }

    feedContainer.appendChild(descriptionElement);
    feeds.appendChild(feedContainer);
  });

  const activePosts = state.posts.filter(({ feedId }) => feedId === activeFeedId);
  activePosts.forEach((post) => {
    const { link, title } = post;

    const postContainer = document.createElement('div');
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.textContent = title;
    const br = document.createElement('br');

    postContainer.appendChild(linkElement);
    postContainer.appendChild(br);

    posts.appendChild(postContainer);
  });
};

export default (state) => {
  watch(state.form, 'processState', () => {
    const { form: { processState }, elements } = state;
    const { formContainer, submit, input } = elements;

    const existingFeedback = formContainer.querySelector('.feedback');
    if (existingFeedback) {
      formContainer.removeChild(existingFeedback);
    }

    switch (processState) {
      case 'filling': {
        break;
      }
      case 'sending': {
        submit.disabled = true;
        break;
      }
      case 'failed': {
        const { form: { messageType, messageContext } } = state;
        const infoMessage = i18next.t(`messages.${messageType}`, messageContext);
        const feedbackElement = document.createElement('div');
        feedbackElement.classList.add('feedback', 'text-danger');
        feedbackElement.textContent = infoMessage;
        formContainer.appendChild(feedbackElement);

        input.style.borderColor = 'red';
        submit.disabled = false;
        submit.blur();
        break;
      }
      case 'finished': {
        const infoMessage = i18next.t(`messages.${state.form.messageType}`);
        const feedbackElement = document.createElement('div');
        feedbackElement.classList.add('feedback', 'text-success');
        feedbackElement.textContent = infoMessage;
        formContainer.appendChild(feedbackElement);

        input.value = '';
        input.style.removeProperty('border');
        submit.disabled = false;
        submit.blur();

        showRSSFeeds(state);
        break;
      }
      default: {
        throw new Error(`Unknown state: ${processState}`);
      }
    }
  });
};
