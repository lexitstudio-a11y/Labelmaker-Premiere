// Label Maker — host script (ExtendScript / Premiere Pro DOM + QE DOM)
//
// Applies the 16 built-in Premiere Pro clip label colors, in their fixed
// palette order (Violet, Iris, Caraibe, Lavande, Ceruleen, Foret, Rose,
// Mangue, Pourpre, Bleu, Bleu-vert, Magenta, Brun roux, Vert, Marron, Jaune),
// to the currently selected timeline clips, cycling back to Violet after
// Jaune when more than 16 clips are selected.
//
// Ordering rule: clips are labelled in the order they start on the
// timeline (leftmost first). When several selected clips start at the
// exact same time on different tracks, the visually lowest one on the
// timeline (closer to the video/audio divider) receives the earlier label.
//
// Setting a clip's label color is not exposed on the documented
// TrackItem object, so this uses the undocumented QE ("Quality
// Engineering") DOM, which is the standard, widely used workaround for
// this exact limitation. Selection state is also read from the QE DOM
// (qeTrackItem.isSelected()) since it lines up 1:1 by index with the
// documented track.clips collection, which supplies the reliable start
// time used for sorting.

var LABELMAKER_COLOR_COUNT = 16;

function labelmaker_setColor(qeItem, colorIndex) {
    try {
        if (typeof qeItem.setColorAsLabel === "function") {
            qeItem.setColorAsLabel(colorIndex);
            return true;
        }
    } catch (e1) {}
    try {
        if (typeof qeItem.setColorLabel === "function") {
            qeItem.setColorLabel(colorIndex);
            return true;
        }
    } catch (e2) {}
    return false;
}

function labelmaker_collectSelected(seq, qeSeq) {
    var candidates = [];
    var numV = seq.videoTracks.numTracks;
    var numA = seq.audioTracks.numTracks;

    for (var vt = 0; vt < numV; vt++) {
        var docTrackV = seq.videoTracks[vt];
        var qeTrackV = qeSeq.getVideoTrackAt(vt);
        if (!qeTrackV) continue;
        var nV = docTrackV.clips.numItems;
        for (var ci = 0; ci < nV; ci++) {
            var docItem = docTrackV.clips[ci];
            var qeItem = qeTrackV.getItemAt(ci);
            if (!qeItem || typeof qeItem.isSelected !== "function") continue;
            if (docItem.type !== "Clip") continue;
            if (!qeItem.isSelected()) continue;
            candidates.push({
                qeItem: qeItem,
                start: docItem.start.seconds,
                // Highest video track sits visually at rank 0 (top); V1 is
                // the lowest video track, so it gets the highest rank.
                rank: (numV - 1 - vt)
            });
        }
    }

    for (var at = 0; at < numA; at++) {
        var docTrackA = seq.audioTracks[at];
        var qeTrackA = qeSeq.getAudioTrackAt(at);
        if (!qeTrackA) continue;
        var nA = docTrackA.clips.numItems;
        for (var cj = 0; cj < nA; cj++) {
            var docItemA = docTrackA.clips[cj];
            var qeItemA = qeTrackA.getItemAt(cj);
            if (!qeItemA || typeof qeItemA.isSelected !== "function") continue;
            if (docItemA.type !== "Clip") continue;
            if (!qeItemA.isSelected()) continue;
            candidates.push({
                qeItem: qeItemA,
                start: docItemA.start.seconds,
                // Audio tracks sit below every video track; A1 is the
                // topmost audio track, so it ranks just under V1.
                rank: (numV + at)
            });
        }
    }

    return candidates;
}

function labelmaker_applyCroissant() {
    var seq = app.project.activeSequence;
    if (!seq) {
        return "error:no_sequence";
    }

    app.enableQE();
    var qeSeq = qe.project.getActiveSequence();
    if (!qeSeq) {
        return "error:no_qe_sequence";
    }

    var candidates = labelmaker_collectSelected(seq, qeSeq);
    if (candidates.length === 0) {
        return "error:no_selection";
    }

    // Order by timeline position: earliest start first, then lowest
    // track first for clips that start at the exact same time.
    candidates.sort(function (a, b) {
        if (a.start !== b.start) {
            return a.start - b.start;
        }
        return b.rank - a.rank;
    });

    var applied = 0;
    for (var i = 0; i < candidates.length; i++) {
        var colorIndex = i % LABELMAKER_COLOR_COUNT;
        if (labelmaker_setColor(candidates[i].qeItem, colorIndex)) {
            applied++;
        }
    }

    if (applied === 0) {
        return "error:label_unsupported";
    }

    return "success:" + applied + "/" + candidates.length;
}
