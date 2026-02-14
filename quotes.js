const quotes = [
    "'O you who believe, fasting has been prescribed for you as it was prescribed for those before you so that you may become mindful of Allah.' (Qur'an 2:183)",
    "'The month of Ramadan is that in which was revealed the Qur'an, a guidance for the people.' (Qur'an 2:185)",
    "'Eat and drink until the white thread of dawn becomes distinct from the black thread.' (Qur'an 2:187)",
    "'And that you fast is better for you, if only you knew.' (Qur'an 2:184)",
    "'When My servants ask you about Me, I am always near. I answer their prayers when they pray to Me.' (Qur'an 2:186)",
    "'Whoever fasts Ramadan with faith and seeking reward will have his past sins forgiven.' (Sahih al-Bukhari, Sahih Muslim)",
    "'Fasting is a shield.' (Sahih al-Bukhari)",
    "'When Ramadan begins, the gates of Paradise are opened and the gates of Hell are closed.' (Sahih al-Bukhari)",
    "'The supplication of the fasting person is not rejected.' (Sunan Ibn Majah)",
    "'The fasting person has two joys: one at iftar and one when meeting his Lord.' (Sahih al-Bukhari)",
    "'By Him in whose hand is my soul, the smell of the fasting person's mouth is more fragrant to Allah than the scent of musk.' (Sahih Muslim)",
    "'Allah says: Fasting is for Me, and I shall reward for it.' (Sahih al-Bukhari, Hadith Qudsi)",
    "'Whoever feeds a fasting person will have a reward like his, without that detracting from the reward of the fasting person.' (Sunan at-Tirmidhi)",
    "'There is a gate in Paradise called Ar-Rayyan, and those who fast will enter through it.' (Sahih al-Bukhari)",
    "'Whoever stands in prayer during the nights of Ramadan with faith and seeking reward will be forgiven his past sins.' (Sahih al-Bukhari)",
    "'Fasting is not just from food and drink; fasting is from vanity and obscenity.' (Sahih Ibn Hibban)",
    "'Whoever does not give up false speech and acting upon it, Allah has no need of his giving up his food and drink.' (Sahih al-Bukhari)",
    "'Take Suhoor, for in Suhoor there is blessing.' (Sahih al-Bukhari)",
    "'The people will remain upon goodness as long as they hasten to break their fast.' (Sahih al-Bukhari)",
    "'Whoever fasts a day for the sake of Allah, Allah will keep his face away from the Fire for seventy years.' (Sahih al-Bukhari)",
    "'Fasting and the Qur'an will intercede for the servant on the Day of Resurrection.' (Musnad Ahmad)",
    "'The five daily prayers and from one Ramadan to the next are expiations for what is between them.' (Sahih Muslim)",
    "'The Prophet (PBUH) was the most generous of people, and he was even more generous in Ramadan.' (Sahih al-Bukhari)",
    "'Whoever fasts Ramadan and follows it with six days of Shawwal, it is as if he fasted for a lifetime.' (Sahih Muslim)",
    "'If someone abuses a fasting person or fights him, let him say: I am fasting, I am fasting.' (Sahih Muslim)",
    "'Search for the Night of Decree (Laylat al-Qadr) in the odd nights of the last ten days of Ramadan.' (Sahih al-Bukhari)",
    "'Whoever spends the night of Laylat al-Qadr in prayer with faith and seeking reward will be forgiven his past sins.' (Sahih al-Bukhari)",
    "'Allah has people whom He redeems from the Fire every night of Ramadan.' (Sunan Ibn Majah)",
    "'Fasting is a shield from the Hell-fire.' (Sunan at-Tirmidhi)",
    "'The best charity is that given in Ramadan.' (Sunan at-Tirmidhi)",
    "'Umrah performed in the month of Ramadan is equivalent to Hajj in reward.' (Sahih al-Bukhari)",
    "'Every deed of the son of Adam is multiplied ten to seven hundred times, except fasting.' (Sahih Muslim)",
    "'Islam is built on five pillars... and fasting the month of Ramadan.' (Sahih al-Bukhari)",
    "'When it is a day of fasting, do not use obscene language or raise your voice in anger.' (Sahih al-Bukhari)",
    "'Fasting is half of patience.' (Sunan at-Tirmidhi)",
    "'He who fasts the month of Ramadan out of sincere faith, Allah will record for him the reward of a year's fasting.' (Musnad Ahmad)",
    "'The sleep of a fasting person is worship and his silence is tasbeeh (glorification of Allah).' (Shu'ab al-Iman - Al-Bayhaqi)",
    "'Three people's du'as are never rejected: the fasting person until he breaks his fast...' (Sunan at-Tirmidhi)",
    "'O Allah, for You I have fasted and with Your provision I have broken my fast.' (Sunan Abi Dawud)",
    "'Truly, the heart of the fasting person is purified through his devotion to Allah.' (Various authentic commentaries)"
];

function randomQuote() {
    const quoteElement = document.getElementById("quote");
    if (!quoteElement || !quotes.length) return;

    const random = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.innerText = random;
}
