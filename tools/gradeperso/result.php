<?php

header('Access-Control-Allow-Origin: *');

if (!isset($_GET['title'])) {
    http_response_code(422);
    die(json_encode(['message' => 'No title provided']));
}

$whitelist = [
    'empereur',
    'beaugosse',
    'gueteur',
    'supreme',
    'princesse',
    'prince',
    'ultra',
    'dieux',
    'lumiere',
    'online',
    'miracle',
    'king',
    'roi',
    'ange',
    'demon',
    'destructur',
    'puissance',
    'rupture',
    'disciple',
    'x',
    'elite',
    'ascentia',
    'légende',
    'summer',
    'joyeux',
    'magie',
    'ninja'
];
$blacklist = [
    'joueur',
    'minivip',
    'vip',
    'vip+',
    'vip++',
    'heros',
    'superheros',
    'youtubeur',
    'youtuber',
    'youtubeur+',
    'youtuber+',
    'youtubeur++',
    'youtuber++',
    'helper',
    'modo',
    'moderateur',
    'admin',
    'fondateur',
    'supermodo',
    'vape',
    'cheat',
    'wurst',
    'huzuni',
    'bypass',
    'skillclient',
    'wolfframe',
    'nodus',
    'jigsaw',
    'ghostclient',
    'ntm',
    'fdp',
    'tamere',
    'tonpere',
    'connard',
    'pupute',
    'abaaoud',
    'morochuiifs',
    'terroriste',
    'fuck',
    'rouge',
    'bleu',
    'vert',
    'jaune',
    'violet',
    'voilette',
    'orange',
    'bleue',
    'cyan',
    'blanc',
    'noir',
    'noire',
    'zombie',
    'humain',
    'pipi',
    'caca',
    'merde',
    'shit',
    'nazi',
    'hitlair',
    'hitler',
    'vivitlair',
    'staline',
    'auschwitz',
    'mvp'
];

$title = strtolower($_GET['title']);

if (in_array($title, $whitelist, true)) {
    exit(json_encode(['allowed' => true]));
}

if (in_array($title, $blacklist, true)) {
    exit(json_encode(['allowed' => false]));
}

exit(json_encode(['allowed' => 'unknown']));
