const quotes = [
    "'O you who believe, fasting has been prescribed for you as it was prescribed for those before you so that you may become mindful of Allah.' (Qur'an 2:183)",
    "'The month of Ramadan is that in which was revealed the Qur'an, a guidance for the people.' (Qur'an 2:185)",
    "'When My servants ask you ˹O Prophet˺ about Me: I am truly near. I respond to one’s prayer when they call upon Me. So let them respond ˹with obedience˺ to Me and believe in Me, perhaps they will be guided ˹to the Right Way˺' (Qur'an 2:186)",
    "'[Fasting for] a limited number of days. But to fast is best for you, if only you knew.' (Qur'an 2:184)",
    "'Eat and drink until the white thread of dawn becomes distinct to you from the black thread of night. Then complete the fast until the sunset.' (Qur'an 2:187)",
    "'Whoever observes fasts during the month of Ramadan out of sincere faith and hoping to attain Allah's rewards, then all his past sins will be forgiven.' (Sahih al-Bukhari 38, Sahih Muslim 760)",
    "'When the month of Ramadan starts, the gates of the heaven are opened, the gates of Hell are closed, and the devils are chained.' (Sahih al-Bukhari 1899, Sahih Muslim 1079)",
    "'Fasting is a shield. So, the person observing fasting should avoid sexual relations and should not behave foolishly or impudently.' (Sahih al-Bukhari 1894, Sahih Muslim 1151)",
    "'Every deed of the son of Adam is multiplied ten to seven hundred times, except fasting. Allah says: Fasting is for Me, and I shall reward for it.' (Hadith Qudsi)",
    "'The fasting person has two joys: one when he breaks his fast and one when he meets his Lord.' (Sahih al-Bukhari 1904, Sahih Muslim 1151)",
    "'By Him in Whose Hands my soul is, the smell coming out from the mouth of a fasting person is more fragrant to Allah than the scent of musk.' (Sahih al-Bukhari 1904, Sahih Muslim 1151)",
    "'Whoever stands in prayer during the nights of Ramadan with faith and seeking reward will be forgiven his past sins.' (Sahih al-Bukhari 37, Sahih Muslim 759)",
    "'Whoever provides food for a fasting person to break his fast will have a reward like his, without that detracting from the reward of the fasting person.' (Sunan at-Tirmidhi 807)",
    "'Take Suhoor, for indeed in Suhoor there is a blessing.' (Sahih al-Bukhari 1923, Sahih Muslim 1095)",
    "'Search for the Night of Decree (Laylat al-Qadr) in the odd nights of the last ten days of Ramadan.' (Sahih al-Bukhari 2017)",
    "'The five daily prayers, and from one Friday to the next, and from one Ramadan to the next are expiations for what is between them.' (Sahih Muslim 233)",
    "'Fasting is half of patience.' (Sunan at-Tirmidhi 3519)",
    "'Fasting is the bridle of those who fear Allah and the shield of those who wage war against desires.' (Ibn al-Qayyim, Zad al-Ma'ad)",
    "'A sin that causes you to humble yourself to Him is dearer to Him than a righteous act accompanied by boastful self-righteousness.' (Ibn al-Qayyim, Madaarij al-Saalikeen)",
    "'The heart gets sick as the body does, and its cure is in asking for forgiveness.' (Ibn al-Qayyim, Madaarij al-Saalikeen)",
    "'Repel the thought, for if you don't, it becomes an idea. Repel the idea, for if you don't, it will become a desire.' (Ibn al-Qayyim, Al-Fawa'id)",
    "'Fasting has an amazing effect in preserving one's outer limbs and inner capacities.' (Ibn al-Qayyim, Zad al-Ma'ad)",
    "'What matters the most are excellent endings, not faulty beginnings.' (Ibn Taymiyyah, Majmu' al-Fatawa)",
    "'The soul finds true joy and contentment in devotion, and fasting is among the greatest forms of devotion.' (Ibn Taymiyyah)",
    "'Guidance is not attained except with knowledge, and correct direction is not attained except with patience.' (Ibn Taymiyyah, Majmu' al-Fatawa)",
    "'The intention to fast is naturally formed when one knows that tomorrow is Ramadan.' (Ibn Taymiyyah, Fasting and Moonsighting Treatise)",
    "'The more humble, needy, and subdued you are before Allah, the closer you will be to Him.' (Ibn Taymiyyah, Majmu' al-Fatawa)",
    "'Fasting is of three levels: the fast of the general public, the fast of the select few, and the fast of the elite among the select.' (Imam al-Ghazali, Ihya Ulum al-Din)",
    "'The fast of the elite is the fasting of the heart—keeping it free from lowly thoughts and worldly concerns.' (Imam al-Ghazali, Ihya Ulum al-Din)",
    "'The aim of fasting is to adopt the divine qualities of Allah and to emulate the angels in restraining desires.' (Imam al-Ghazali, Ihya Ulum al-Din)",
    "'Many of those who fast get nothing from it but hunger and thirst! This is because they fast with their stomachs but not with their hearts.' (Imam al-Ghazali, Ihya Ulum al-Din)",
    "'Rajab is the month to sow the seeds; Sha'ban is the month to irrigate the crops; and Ramadan is the month to reap the harvest.' (Ibn Rajab, Lata'if al-Ma'arif)",
    "'How can the believer not shed tears at the departure of Ramadan, when he does not know if he will live to see its return?' (Ibn Rajab, Lata'if al-Ma'arif)",
    "'Fasting combines all three types of patience: patience in obeying, in refraining, and in accepting decree.' (Ibn Rajab, Lata'if al-Ma'arif)",
    "'If you don't have the ability to compete with the pious in deeds, compete with the sinners in seeking Allah's forgiveness.' (Ibn Rajab, Lata'if al-Ma'arif)"
];

function randomQuote() {
    const quoteElement = document.getElementById("quote");
    if (!quoteElement || !quotes.length) return;

    const random = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.innerText = random;
}
