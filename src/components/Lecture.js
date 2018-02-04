import React, {Component} from 'react'
import {Button, Modal} from "react-materialize";
import * as Clappr from "clappr";
import {P2P_VIDEOS_PATH} from "../constants";


class Lecture extends Component {

    constructor(){
        super();
        Lecture.playVideo = Lecture.playVideo.bind(this)
    }

    static playVideo(e){
        let week = e.target.dataset.week,
            part = e.target.dataset.part,
            video = e.target.dataset.video,
            file = e.target.dataset.file
        Lecture.clearPlayer('player-'+week+'-'+part+'-'+video);
        var player = new Clappr.Player({
            source: "http://portal.programming.kr.ua:1935/videobackbone/videos/"+ file +"/playlist.m3u8",
            parentId: '#player-'+week+'-'+part+'-'+video,
            autoPlay: true,
            width: "100%"
        });
    }

    static clearPlayer(s) {
        document.getElementById(s).innerHTML = ''
    }

    render() {
        const lecture = this.props.lecture,
            lecture_index = this.props.lecture_index,
            week_index = this.props.week_index,
            videos = this.props.videos
        return (
            <div>
                Часть {lecture.title}:
                {
                    lecture.materials.map((material, i) =>
                        <span key={'material' + i}>
                            &nbsp;
                            <a href={material.link} target="_blank" rel="noopener noreferrer">{material.type}</a>
                            {lecture.materials.length > i ? "," : ""}&nbsp;
                        </span>
                    )
                }
                {videos &&
                <Modal
                    trigger={<a href="#">видео</a>}
                    actions={
                        <Button modal="close" className="close-button">х</Button>
                    }
                >
                    <div id="videoBlock">
                        <h4>Видео: неделя <span>{week_index+1}</span>, часть <span>{videos.part}</span></h4>
                        <table id="videos_list">
                            <tbody >
                            {videos.files.map((file, i) =>
                                <tr key={file.path}>
                                    <td>видео {i+1}</td>
                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                                    <td>{file.len}</td>
                                    <td>
                                        <Modal
                                            modalOptions={
                                                {
                                                    complete: () => {
                                                        Lecture.clearPlayer("player-"+ week_index + "-" +videos.part + "-" + i)
                                                    }
                                                }
                                            }
                                            actions={
                                                <Button modal="close" className="close-button">х</Button>
                                            }
                                            header={'Видео: неделя ' + (week_index + 1) + ', часть ' + videos.part +', видео ' + (i + 1)}
                                            trigger={
                                                <span>
                                                    <Button waves="light" onClick={Lecture.playVideo}
                                                            data-week={week_index} data-part={videos.part}
                                                            data-video={i} data-file={file.path}>
                                                            <i className='fa fa-play'/> смотреть
                                                    </Button>
                                                </span>
                                            }
                                        >
                                            <div id={"player-"+ week_index + "-" +videos.part + "-" + i}/>
                                        </Modal>
                                    </td>
                                    <td><a className='btn waves-effect' href={P2P_VIDEOS_PATH + file.filename + '&download=true&directory=' + file.directory }><i className='fa fa-download'/> скачать</a></td>
                                </tr>)
                            }
                            </tbody>
                        </table>
                    </div>
                </Modal>
                }
            </div>
        )
    }
}

export default Lecture
