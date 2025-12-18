var authorization = "Bearer ***"; // Replace *** by your Authentication Value, usually starts with a lot of AAAAAAAAAA's
var client_tid = "***"; // Replace *** by X-Client-Transaction-Id value
var username = "***"; // Replace 'Username' with your X.com Username (But WITHOUT the @ !!!)

// ================= DELETE OPTION / FILTER =================
var delete_options = {
    "unretweet": true, // "true" Unretweets all your Retweets (maybe not delete the private account), "false" Keeps all your retweets on your profile and won't unretweet/delete them.
    "do_not_remove_pinned_tweet": false, // This option is so that you won't accidentally delete your pinned tweet. If you DO want to delete it, set this option to "false".
    "after_date": new Date('1900-01-01'), // Only deletes Tweets AFTER/BEFORE the set date (excluding it).
    "before_date": new Date('2100-01-01'), // CAUTION: Sometimes it uses your Timezone and sometimes it uses GMT. So better give a day of buffer and delete the rest yourself, if you don't want to risk losing any Tweets outside the date range.
    "from_archive": false, // Do you want to import the Tweets from an X Archive? (UNTESTED! Might not work!).
    "delete_message_with_url_only": false, // If this is set to "true" ONLY Tweets containing Links will be deleted
    "delete_specific_ids_only": [""],  // Better don't touch. Takes an Array and deletes exactly the Tweets with the IDs contained in it.
    "match_any_keywords": [""], // Will only delete Tweets that have at least one of the keywords specified here. It is an array, so use it like this: ["badword1", "badword2", "badword3"].
    "tweets_to_ignore": [""], // If you want to keep any tweets no matter what, get their IDs (The Number in the URL Bar when you clicked on it) and put them here. They won't be touched (i hope).
    "old_tweets": false // This option probably doesn't work as of May 2025, but if you try it and it fails please open an Issue in this Git project so I can debug it. I have no old tweets myself.
};

/*
 * !!!  D O  N O T  T O U C H  A N Y T H I N G  A F T E R  T H I S  P O I N T  !!!
 */

var ua = navigator.userAgentData.brands.map(brand => `"${brand.brand}";v="${brand.version}"`).join(', ');
var csrf_token = getCookie("ct0");
var random_resource = "61HQnvcGP870hiE-hCbG4A"; // New resource ID. You can change it with newer from here if X changed it. https://x.com/i/api/graphql/CHANGEWITHTHIS/UserTweetsAndReplies
var language_code = navigator.language.split("-")[0];
var tweets_to_delete = [];
var stop_signal = undefined;

const getUserId = () => {
    const twid_match = document.cookie.match(/twid="u%3D([0-9]+)/) || document.cookie.match(/twid=u%3D([0-9]+)/);
    if (twid_match && twid_match[1]) return twid_match[1];
    const auth_token_match = document.cookie.match(/auth_token=([0-9]+)-/);
    if (auth_token_match && auth_token_match[1]) return auth_token_match[1];
    throw new Error("Failed to get the 'user_id' from the cookie. Make sure you are logged in.");
};
var user_id = getUserId();


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch_tweets(cursor) {
    let count = "40";
    let endpoint = "UserTweetsAndReplies";
    let base_url = `https://x.com/i/api/graphql/${random_resource}/${endpoint}`;

    let variables = { userId: user_id, count: parseInt(count), includePromotedContent: false, withCommunity: true, withVoice: true };
    if (cursor) { variables.cursor = cursor; }

    let features = {
        "rweb_tipjar_consumption_enabled": true,
        "responsive_web_graphql_exclude_directive_enabled": true,
        "verified_phone_label_enabled": false,
        "creator_subscriptions_tweet_preview_api_enabled": true,
        "responsive_web_graphql_timeline_navigation_enabled": true,
        "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
        "tweetypie_unmention_optimization_enabled": true, "responsive_web_edit_tweet_api_enabled": true,
        "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true, "view_counts_everywhere_api_enabled": true,
        "longform_notetweets_consumption_enabled": true, "responsive_web_twitter_article_tweet_consumption_enabled": true,
        "tweet_awards_web_tipping_enabled": false, "freedom_of_speech_not_reach_fetch_enabled": true, "standardized_nudges_misinfo": true,
        "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
        "longform_notetweets_rich_text_read_enabled": true,
        "longform_notetweets_inline_media_enabled": true,
        "responsive_web_media_download_video_enabled": false,
        "responsive_web_enhance_cards_enabled": false,
        "responsive_web_grok_community_note_auto_translation_is_enabled": false,
        "payments_enabled": false,
        "profile_label_improvements_pcf_label_in_post_enabled": true,
        "responsive_web_grok_show_grok_translated_post": false,
        "communities_web_enable_tweet_community_results_fetch": true,
        "responsive_web_grok_analyze_post_followups_enabled": true,
        "responsive_web_grok_analysis_button_from_backend": false,
        "creator_subscriptions_quote_tweet_preview_enabled": false,
        "responsive_web_grok_analyze_button_fetch_trends_enabled": false,
        "c9s_tweet_anatomy_moderator_badge_enabled": true,
        "articles_preview_enabled": true,
        "responsive_web_grok_share_attachment_enabled": true,
        "responsive_web_grok_image_annotation_enabled": true,
        "responsive_web_jetfuel_frame": true,
        "rweb_video_screen_enabled": false,
        "premium_content_api_read_enabled": false,
        "responsive_web_profile_redirect_enabled": true,
        "responsive_web_grok_imagine_annotation_enabled": false
    };

    const params = new URLSearchParams({ variables: JSON.stringify(variables), features: JSON.stringify(features) });
    let final_url = `${base_url}?${params}`;

    const response = await fetch(final_url, {
        "headers": { "authorization": authorization, "x-csrf-token": csrf_token, "x-client-transaction-id": client_tid, "accept": "*/*", "content-type": "application/json", "sec-ch-ua": ua, "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": "\"Windows\"", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin" },
        "method": "GET", "mode": "cors", "credentials": "include"
    });

    if (!response.ok) {
        console.error(`Failed to fetch data, status: ${response.status}`);
        console.error(await response.text());
        return null;
    }
    const data = await response.json();

    let instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions || data?.data?.user?.result?.timeline?.timeline?.instructions;

    if (!instructions) { console.error("Unexpected API:", data); return null; }
    return instructions.find(i => i.type === "TimelineAddEntries")?.entries || [];
}

async function log_tweets(entries) {
    if (!entries || entries.length === 0) { return "finished"; }
    let next_cursor = null;
    for (let item of entries) {
        if (item["entryId"].startsWith("tweet-") || item["entryId"].startsWith("profile-conversation-")) {
            findTweetIds(item);
        } else if (item["entryId"].startsWith("cursor-bottom")) {
            next_cursor = item["content"]["value"];
        }
    }
    return next_cursor || "finished";
}

function check_date(tweet) {
    if (tweet?.legacy?.created_at) {
        let tweet_date = new Date(tweet.legacy.created_at);
        if (tweet_date >= delete_options.before_date || tweet_date <= delete_options.after_date) {
            if (tweet_date <= delete_options.after_date) stop_signal = true;
            return false;
        }
    } return true;
}

function check_filter(tweet) {
    if (!tweet?.legacy?.id_str || (delete_options["tweets_to_ignore"]?.includes(tweet.legacy.id_str))) return false;

    if (tweet?.legacy?.retweeted_status_result && !delete_options.unretweet) return false;

    if (!check_date(tweet)) return false;

    if (delete_options["delete_specific_ids_only"] && delete_options["delete_specific_ids_only"].length > 0 && delete_options["delete_specific_ids_only"][0] !== "") {
        if (!delete_options["delete_specific_ids_only"].includes(tweet.legacy.id_str)) {
            return false;
        }
    }

    if (delete_options["delete_message_with_url_only"]) {
        const tweet_text = tweet?.legacy?.full_text || "";
        const has_url = /https?:\/\/[^\s]+/.test(tweet_text) ||
            tweet?.legacy?.entities?.urls?.length > 0 ||
            tweet?.legacy?.entities?.media?.length > 0;
        if (!has_url) return false;
    }

    if (delete_options["match_any_keywords"] && delete_options["match_any_keywords"].length > 0 && delete_options["match_any_keywords"][0] !== "") {
        const tweet_text = (tweet?.legacy?.full_text || "").toLowerCase();
        const has_keyword = delete_options["match_any_keywords"].some(keyword =>
            keyword && tweet_text.includes(keyword.toLowerCase())
        );
        if (!has_keyword) return false;
    }

    return true;
}

function findTweetIds(obj) {
    function recurse(currentObj) {
        if (typeof currentObj !== 'object' || currentObj === null) return;
        if (delete_options["do_not_remove_pinned_tweet"] && (currentObj.tweetDisplayType === "PinnedTweet" || currentObj.__typename === "TimelinePinEntry")) return;

        let tweet_to_check = currentObj.itemContent?.tweet_results?.result || currentObj.tweet_results?.result || currentObj.tweet || currentObj;

        if (tweet_to_check?.legacy && tweet_to_check?.legacy?.user_id_str === user_id && check_filter(tweet_to_check)) {
            if (!tweets_to_delete.includes(tweet_to_check.legacy.id_str)) {
                tweets_to_delete.push(tweet_to_check.legacy.id_str);
                console.log(`✔️ Found: ${tweet_to_check.legacy.full_text.substring(0, 70)}...`);
            }
        }
        for (let key in currentObj) { if (currentObj.hasOwnProperty(key)) { recurse(currentObj[key]); } }
    }
    recurse(obj);
}

async function delete_tweets(id_list) {
    const deleteQueryId = "VaenaVgh5q5ih7kvyVjgtg";
    let id_list_size = id_list.length;
    for (let i = 0; i < id_list_size; ++i) {
        let tweet_id = id_list[i];
        const response = await fetch(`https://x.com/i/api/graphql/${deleteQueryId}/DeleteTweet`, {
            "headers": { "authorization": authorization, "x-csrf-token": csrf_token, "content-type": "application/json" },
            "body": JSON.stringify({ "variables": { "tweet_id": tweet_id, "dark_request": false }, "queryId": deleteQueryId }),
            "method": "POST", "credentials": "include"
        });
        if (response.ok) {
            console.log(`✅ Success deleting ${i + 1}/${id_list_size}: ID ${tweet_id}`);
        } else {
            console.error(`❌ Failed to delete ${tweet_id}, Status: ${response.status}`);
            if (response.status === 429) { console.warn("Retry..."); await sleep(60000); i--; }
        }
        await sleep(1000);
    }
}

async function run() {
    console.log("🚀 Starting...");
    console.log("📋 Active filters:");
    console.log(`- Unretweet: ${delete_options.unretweet}`);
    console.log(`- Keep pinned tweet: ${delete_options.do_not_remove_pinned_tweet}`);
    console.log(`- After date: ${delete_options.after_date.toDateString()}`);
    console.log(`- Before date: ${delete_options.before_date.toDateString()}`);
    if (delete_options.delete_message_with_url_only) console.log(`- URL only: ${delete_options.delete_message_with_url_only}`);
    if (delete_options.delete_specific_ids_only && delete_options.delete_specific_ids_only[0] !== "") console.log(`- Specific IDs: ${delete_options.delete_specific_ids_only.length} IDs`);
    if (delete_options.match_any_keywords && delete_options.match_any_keywords[0] !== "") console.log(`- Keywords: ${delete_options.match_any_keywords.join(', ')}`);
    if (delete_options.tweets_to_ignore && delete_options.tweets_to_ignore[0] !== "") console.log(`- Ignored tweets: ${delete_options.tweets_to_ignore.length} IDs`);

    await sleep(2000);
    let next = null;
    while (next !== "finished" && !stop_signal) {
        let entries = await fetch_tweets(next);
        if (!entries) break;
        if (entries.length === 0) break;

        next = await log_tweets(entries);

        if (tweets_to_delete.length > 0) {
            console.log(`\n🔥 Deleting this batch ${tweets_to_delete.length} tweet...`);
            await delete_tweets(tweets_to_delete);
            tweets_to_delete = [];
        } else {
            console.log("There are no tweets matching the filters on this page.");
        }

        if (next && next !== "finished") {
            console.log("\n--- Wait 3 seconds before the next page ---\n");
            await sleep(3000);
        } else {
            break;
        }
    }
    console.log("✅ DELETE COMPLETE!");
}

run();
