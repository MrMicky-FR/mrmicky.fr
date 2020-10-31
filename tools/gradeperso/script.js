// http://jsfiddle.net/468whu2o/
function renderAsHtml(toRender) {
    let html = '';
    let color = false;
    for (let i = 0; i < toRender.length; i++) {
        let c = toRender[i];
        if (c === '&' && ++i < toRender.length) {
            let code = toRender[i];
            if (/[2-9a-f]/.test(code) || code === 'r') {
                if (color) {
                    html += '</span>';
                    color = false;
                }
                if (code !== 'r') {
                    html += '<span class="mc-color-' + code + '">';
                    color = true;
                }
                continue;
            }
            c += code;
        }
        html += c;
    }
    if (color) {
        html += '</span>';
    }
    return '<span class="mc-color-f">' + html + '</span>';
}

function parseTitleAndName() {
    if (!window.location.hash) {
        return null;
    }

    const split = decodeURI(window.location.hash.substring(1)).split('|');

    if (split.length !== 2) {
        return null;
    }

    return split;
}

const parsed = parseTitleAndName();

const app = new Vue({
    el: '#app',
    data: {
        title: parsed ? parsed[0] : '',
        name: parsed ? parsed[1] : '',
        hasDuplicatesColor: false,
        colors: {
            // 1: 'Bleu foncé',
            2: 'Vert foncé',
            3: 'Bleu turquoise',
            4: 'Route foncé',
            5: 'Violet',
            6: 'Orange',
            7: 'Gris clair',
            8: 'Gris foncé',
            9: 'Bleu royal',
            // 0: 'Noir',
            a: 'Vert clair',
            b: 'Bleu clair',
            c: 'Rouge clair',
            d: 'Rose',
            e: 'Jaune',
            f: 'Blanc',
        },
        validText: -1,
    },
    watch: {
        title(title) {
            if (title.includes('§')) {
                const pos = this.$refs.prefixInput.selectionStart;

                this.$nextTick(function () {
                    this.$refs.prefixInput.selectionEnd = pos;
                });

                this.title = title.replace(/§/g, '&');
            }

            this.updateUrl();
        },
        stripedTitle() {
            this.validText = -1;

            if (this.stripedTitle.length === 0) {
                return;
            }

            axios.get('https://mrmicky.fr/tools/gradeperso/result.php', {
                params: {
                    title: this.stripedTitle,
                },
            }).then(function (response) {
                if (response.data.allowed !== 'unknown') {
                    app.validText = response.data.allowed ? 1 : 0;
                }
            }).catch(function (error) {
                console.error('Error with verification: ' + error);
            });
        },
        name(name) {
            this.name = name.replace(/&[0-9a-f]/g, '');

            this.updateUrl();
        },
    },
    computed: {
        stripedTitle() {
            return this.title.replace(/&[0-9a-f]/g, '');
        },
        titleRender() {
            return renderAsHtml(this.title + ' ' + (this.name ? this.name : 'Pseudo'));
        },
        lastColorCode() {
            for (let i = this.title.length - 2; i >= 0; i--) {
                if (this.title[i] === '&' && this.title[i + 1].replace(/[0-9a-f]/g, '').length === 0) {
                    return this.title[i + 1];
                }
            }
            return 'f';
        },
        upperCount() {
            return this.stripedTitle.replace(/[^A-Z]/g, '').length;
        },
        validLength() {
            return this.stripedTitle.length <= 13;
        },
        validUpperCount() {
            return this.upperCount <= 4;
        },
        validChars() {
            const normalizedTitle = this.stripedTitle.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[A-Z+']/gi, '');

            if (normalizedTitle.length !== 0) {
                return false;
            }

            if (this.stripedTitle.indexOf('+') < 0) {
                return true;
            }

            if (this.stripedTitle.indexOf('+++') >= 0) {
                return false;
            }

            return (this.stripedTitle.indexOf('++') === this.stripedTitle.length - 2) || (this.stripedTitle.indexOf('+') === this.stripedTitle.length - 1);
        },
        validColors() {
            if (this.lastColorCode === 'c' || this.lastColorCode === '4') {
                return false;
            }

            return this.title.length === 0 || (this.countCharsByColor('4') + this.countCharsByColor('c') < this.title.length / 2);
        },
        validTitle() {
            return this.validUpperCount && this.validLength && this.validColors && this.validChars && (this.validText !== 0);
        },
        titleResult() {
            let title = this.title;
            let loop = true;
            let lastColorCode = '';
            let hasDuplicates = false;

            while (loop) {
                let continueLoop = false;

                for (let i = 0; i < title.length; i++) {
                    if (title[i] === '&' && title.length > i + 1) {
                        if ((title.length > i + 3 && title[i + 2] === '&') || lastColorCode === title[i + 1]) {
                            hasDuplicates = true;
                            title = title.substr(0, i) + title.substr(i + 2);
                            continueLoop = true;
                            break;
                        }
                        lastColorCode = title[i + 1];
                    }
                }
                loop = continueLoop;
            }

            this.hasDuplicatesColor = hasDuplicates;

            if (title[0] !== '&') {
                title = '&f' + title;
            }

            return title.replace(/&/g, '§') + (this.name ? (' - ' + this.name) : '');
        },
    },
    methods: {
        updateUrl() {
            if (!this.title && !this.name) {
                window.location.replace('#');
                return;
            }
            window.location.replace('#' + encodeURI(this.title + '|' + this.name));
        },
        rainbowify() {
            const colors = ['4', 'c', '6', 'e', 'a', '2', 'b', '3', '5', 'd'];
            let res = '';
            let i = 0;

            for (; i < this.stripedTitle.length; i++) {
                res += '&' + colors[i % colors.length] + this.stripedTitle[i];
            }
            res += '&' + colors[i % colors.length];

            this.title = res;
        },
        countCharsByColor(color) {
            let found = false;
            let count = 0;

            for (let i = 0; i < this.title.length; i++) {
                if (this.title[i] === '&') {
                    found = this.title[i + 1] === color;
                } else if (i > 0 && this.title[i - 1] !== '&' && found) {
                    count++;
                }
            }
            return count;
        },
        reset() {
            this.name = '';
            this.title = '';
        },
        clearColors() {
            this.title = this.stripedTitle;
        },
        addColor(code) {
            const prefixInput = this.$refs.prefixInput;
            let pos = prefixInput.selectionStart;

            // We don't want duplicated colors
            if (pos >= 2 && this.title[pos - 2] === '&') {
                this.title = this.title.substr(0, pos - 1) + code + this.title.substr(pos);

                pos -= 2;
            } else {
                this.title = this.title.substr(0, pos) + '&' + code + this.title.substr(pos);
            }

            this.$nextTick(function () {
                prefixInput.focus();

                this.$refs.prefixInput.selectionEnd = pos + 2;
            });
        },
        copyResult() {
            let copied = false;

            this.$refs.result.select();

            try {
                if (document.execCommand('copy')) {
                    copied = true;
                    window.getSelection().removeAllRanges();
                }
            } catch (err) {
                console.error(err);
            }

            if ($ && $.fn.tooltip) {
                const copyButton = $('#copyResult');
                const oldTitle = copyButton.attr('data-original-title');
                copyButton.attr('data-original-title', copied ? 'Copié !' : 'CTRL + C pour copier').tooltip('show');
                copyButton.attr('data-original-title', oldTitle ? oldTitle : '');
            }
        },
        badgeColor(valid) {
            return valid ? 'badge-success' : 'badge-danger';
        },
    },
});

// Init tooltips
$('[data-toggle="tooltip"]').tooltip();
